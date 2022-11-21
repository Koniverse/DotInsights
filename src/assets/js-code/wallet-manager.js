(
	function( $ ) {
		'use strict';

        const isFirefox = dotinsights.BrowserUtil.isFirefox;
		const isHandheld = dotinsights.Helpers.isHandheld();
		const WALLETS = {
			'subwallet': {
				name: 'SubWallet',
				type: 'substrate',
				provider: 'subwallet-js',
				logo: '',
				getInstallUrl: function() {
					if ( isHandheld ) {
						return 'https://mobile.subwallet.app';
					} else {
						return isFirefox ? 'https://mzl.la/3rQ0awW' : 'https://bit.ly/3BGqFt1'
					}
				}
			},
			'subwallet-evm': {
				name: 'SubWallet - EVM',
				type: 'evm',
				provider: 'SubWallet',
				evmDetect: 'isSubWallet',
				logo: '',
				getInstallUrl: function() {
					if ( isHandheld ) {
						return 'https://mobile.subwallet.app';
					} else {
						return isFirefox ? 'https://mzl.la/3rQ0awW' : 'https://bit.ly/3BGqFt1'
					}
				}
			}
			/*,
			'metamask': {
				name: 'Metamask',
				type: 'evm',
				provider: 'ethereum',
				evmDetect: 'isMetaMask',
				logo: '',
				getInstallUrl: function() {
					return 'https://metamask.io/download/';
				}
			}
			*/
		};

		const STORE_STATE_KEY = 'dotinsightsWalletInfo';

		const walletUtils = {
			supportedWallets: WALLETS,
			currentWallet: null,
			currentWalletName: null,
			currentWalletType: 'none',
			currentAddress: null,
			currentVoteAbility: false,
			getSavedState: function() {
				const savedState = JSON.parse( localStorage.getItem( STORE_STATE_KEY ) ) || {};

				return {
					currentWalletName: savedState.currentWalletName,
					currentAddress: savedState.currentAddress,
					currentSignMessage: savedState.currentSignMessage,
					currentVoteAbility: savedState.currentVoteAbility,
				}
			},
			saveState: function( newState ) {
				const oldState = walletUtils.getSavedState();
				// Object.assign(walletUtils, newData); Remove because it not safe.
				if ( newState.hasOwnProperty( 'currentWalletName' ) ) {
					walletUtils.currentWalletName = newState.currentWalletName;
					oldState.currentWalletName = newState.currentWalletName;
				}
				if ( newState.hasOwnProperty( 'currentAddress' ) ) {
					walletUtils.currentAddress = newState.currentAddress;
					oldState.currentAddress = newState.currentAddress;
				}
				if ( newState.hasOwnProperty( 'currentSignMessage' ) ) {
					walletUtils.currentSignMessage = newState.currentSignMessage;
					oldState.currentSignMessage = newState.currentSignMessage;
				}
				if ( newState.hasOwnProperty( 'currentVoteAbility' ) ) {
					walletUtils.currentVoteAbility = newState.currentVoteAbility;
					oldState.currentVoteAbility = newState.currentVoteAbility;
				}
				localStorage.setItem( STORE_STATE_KEY, JSON.stringify( oldState ) );
			},
			resetState: function() {
				walletUtils.saveState( {
					currentWalletName: null,
					currentAddress: null,
					currentSignMessage: undefined,
					currentVoteAbility: false
				} );
			},
			loadSavedState: function() {
				const savedData = walletUtils.getSavedState();
				Object.assign( walletUtils, savedData );
			},
			getCurrentWallet: async function() {
				walletUtils.loadSavedState();
				if ( walletUtils.currentWalletName && walletUtils.currentAddress ) {
					return await walletUtils.enableWallet( walletUtils.currentWalletName );
				} else {
					return undefined;
				}
			},
			isInstall: function( walletName ) {
				return ! ! walletUtils.getWallet( walletName )
			},
			isConnectedWithWallet: async function() {
				return ! ! (
					await dotinsights.walletUtils.getCurrentWallet()
				)
			},
			getWallet: function( walletName ) {
				const walletData = walletUtils.supportedWallets[ walletName ]
				if ( ! walletData ) {
					return undefined;
				}
				if ( walletData.type === 'evm' ) {
					if ( window[ walletData.provider ] && window[ walletData.provider ][ walletData.evmDetect ] ) {
						return window[ walletData.provider ]
					}
				} else {
					return window.injectedWeb3 && window.injectedWeb3[ walletData.provider ];
				}
			},
			enableWallet: async function( walletName ) {
				const walletData = walletUtils.supportedWallets[ walletName ];
				if ( ! walletData ) {
					throw new Error( 'Wallet is not support' );
				}

				const walletObj = walletUtils.getWallet( walletName );

				if ( ! walletObj ) {
					throw new Error( 'Wallet is not install' );
				}

				const enableWallet = async function() {
					if ( walletData.type === 'evm' ) {
						return walletObj.request( { method: 'eth_requestAccounts' } );
					} else {
						return walletObj.enable();
					}
				};

				return new Promise( function( resolve, reject ) {
					enableWallet().then( async ( wallet ) => {
						walletUtils.currentWalletType = walletData.type;
						if ( walletData.type === 'evm' ) {
							walletUtils.currentWallet = walletObj;
						} else {
							walletUtils.currentWallet = wallet;
						}

						// Reset saved data
						if ( walletUtils.currentWalletName !== walletName ) {
							walletUtils.saveState( {
								currentWalletName: walletName,
								currentAddress: undefined,
								currentSignMessage: undefined,
								currentVoteAbility: false
							} )
						}

						const accounts = await walletUtils.getAccounts()
						const addresses = accounts.map( a => a.address )
						if ( addresses.indexOf( walletUtils.currentAddress ) < 0 && accounts[ 0 ] && accounts[ 0 ][ 'address' ] ) {
							walletUtils.enableAccount( accounts[ 0 ][ 'address' ] )
							walletUtils.saveState( { currentAddress: accounts[ 0 ][ 'address' ] } )
						}

						resolve( walletUtils.currentWallet );
					} ).catch( () => {
						alert( 'User cancel or reject connect to the wallet' );
						reject( new Error( 'User cancel or reject connect to the wallet' ) )
					} )
				} );
			},
			getAccounts: async function() {
				if ( ! walletUtils.currentWallet ) {
					await walletUtils.getCurrentWallet();
				}
				if ( walletUtils.currentWalletType === 'evm' ) {
					const accounts = await walletUtils.currentWallet.request( { method: 'eth_accounts' } );

					return accounts.map( account => (
						{
							address: account,
							name: account
						}
					) )
				} else {
					return await walletUtils.currentWallet.accounts.get()
				}
			},
			enableAccount: function( address ) {
				if ( walletUtils.currentAddress !== address ) {
					walletUtils.saveState( {
						currentAddress: address,
						currentSignMessage: undefined,
						currentVoteAbility: false
					} )
				}
			},
			getSignMessage: async function( address ) {
				const { message } = await dotinsights.requestUtils.sendPost( dotinsights.Helpers.getApiEndpointUrl( 'getMessage' ), { address } );
				walletUtils.saveState( {
					currentSignMessage: message,
					currentVoteAbility: true
				} )
			},
			signMessage: async function( signMessage ) {
				if ( ! walletUtils.currentWallet && ! walletUtils.currentAddress ) {
					throw new Error( 'Unable get current wallet or current account to sign message' );
				}

				if ( walletUtils.currentWalletType === 'evm' ) {
					// Todo: Support this for MetaMask
					// var Buffer = require('buffer/').Buffer; https://github.com/feross/buffer
					// signMessage = `0x${Buffer.from(signMessage, 'utf8').toString('hex')}`
					return await walletUtils.currentWallet.request( {
						method: 'personal_sign',
						params: [ signMessage, walletUtils.currentAddress ]
					} )
				} else {
					return await walletUtils.currentWallet.signer.signRaw( {
						address: walletUtils.currentAddress,
						data: signMessage
					} )
				}
			},
			signVote: async function( projectID ) {
				try {
					if ( ! walletUtils.currentWallet ) {
						await walletUtils.getCurrentWallet();
					}
					if ( ! walletUtils.currentSignMessage || ! walletUtils.currentVoteAbility ) {
						await walletUtils.getSignMessage( walletUtils.currentAddress );
					}

					if ( ! walletUtils.currentVoteAbility ) {
						throw new Error( 'Unable to vote, required has balance on at least one chain in ecosystem' );
					}

					const signRs = await walletUtils.signMessage( walletUtils.currentSignMessage + '-' + projectID );
					var signature = typeof signRs === 'object' ? signRs.signature : signRs; // EVM return signature as string. Others return as object.

					if ( typeof signature !== 'string' ) {
						throw new Error( 'Invalid signature' );
					}

					return signature;
				} catch ( e ) {
					console.error( e );
					return false
				}
			},
			runTestOnLoadPage() {
				setTimeout( async function() {
					// Load saved state.
					walletUtils.loadSavedState();

					try {
						// Auto connect with wallet is has connected before.
						const isConnectedWithWallet = await walletUtils.isConnectedWithWallet();
						if ( isConnectedWithWallet ) {
							console.log( 'Enable existed wallet' )
							// Connect with wallet
							await walletUtils.enableWallet( walletUtils.currentWalletName );

							// Get account list.
							await walletUtils.getAccounts();

							// Display current account.
							await walletUtils.currentAddress
						} else {
							console.log( 'Not connect with wallet' )
						}
					} catch ( e ) {
						console.error( 'Connect wallet error: ' + e.message )
					}
				}, 500 )
			},
			runTestSelectWallet: function() {
				// Open wallet list.
				const walletList = walletUtils.supportedWallets;
				// Check installations.
				Object.entries( walletUtils.supportedWallets ).forEach( function( [ walletKey, wallet ] ) {
					// Check install status.
					console.log( wallet.name, walletUtils.isInstall( walletKey ) )
					// Check connect status.
					console.log( wallet.name, walletKey === walletUtils.currentWalletName )
				} )

				// Select wallet
				const walletName = 'subwallet';
				walletUtils.enable( walletName )
			},
			runTestSelectAccount: async function() {
				// Get account list.
				const accountList = await walletUtils.getAccounts();

				// Select account 0
				walletUtils.enableAccount( accountList[ 0 ].address )
			},
			runTestVoteProject: async function() {
				// Select account 0.
				const voteSignature = await walletUtils.signVote( 'ProjectID' )

				// Send vote
				// Create vote request with signature to the sever
				console.log( voteSignature )
			}
		};

		window.dotinsights = window.dotinsights || {};
		dotinsights.walletUtils = walletUtils;

		dotinsights.VotedProjects = [];
		var Helpers = dotinsights.Helpers;

		var $modalConnectWallet        = $( '#modal-connect-wallet' ),
		    $modalConnectWalletContent = $modalConnectWallet.find( '.modal-content-body' );

		$modalConnectWallet.dotinsightsModal(); // Init modal.

		$( document ).ready( function() {
			$( document.body ).on( 'click', '.btn-connect-wallet', function( evt ) {
				evt.preventDefault();
				var $thisButton = $( this );

				Helpers.setElementHandling( $thisButton );

				setTimeout( async function() {
					var walletName = $thisButton.data( 'wallet' );

					try {
						await walletUtils.enableWallet( walletName );
						renderWalletArea();
					} catch ( e ) {
						console.error( e );
						Helpers.unsetElementHandling( $thisButton );
					}
				}, 500 );
			} );

			$( document.body ).on( 'click', '.btn-disconnect-wallet', function( evt ) {
				evt.preventDefault();

				var $thisButton = $( this );

				Helpers.setElementHandling( $thisButton );

				setTimeout( function() {
					walletUtils.resetState();

					renderWalletArea();
				}, 500 );
			} );

			renderWalletArea();
		} );

		$( document.body ).on( 'click', '.btn-vote', async function( evt ) {
			evt.preventDefault();

			var $thisButton = $( this ),
			    projectID   = $thisButton.data( 'project-id' );

			const isConnectedWithWallet = await walletUtils.isConnectedWithWallet();
			if ( isConnectedWithWallet ) {
				Helpers.setElementHandling( $thisButton );

				try {
					const voteSignature = await walletUtils.signVote( projectID );

					if ( ! voteSignature ) {
						throw 'Invalid Signature';
					}

					const response = await dotinsights.requestUtils.sendPost( Helpers.getApiEndpointUrl( 'toggleVoteProject' ), {
						project_id: projectID,
						address: walletUtils.currentAddress,
						signature: voteSignature
					} );

					Helpers.unsetElementHandling( $thisButton );

					if ( response.hasOwnProperty( 'vote_count' ) ) {
						dotinsights.Projects = dotinsights.Projects.map( obj =>
							obj.project_id === projectID ? {
								...obj,
								vote_count: response.vote_count
							} : obj
						);

						var $theVoteButtons = $( '.btn-vote[data-project-id="' + projectID + '"]' );
						$theVoteButtons.find( '.button-text' ).text( response.vote_count );
						if ( response.isVote ) {
							$theVoteButtons.removeClass( 'vote-this' ).addClass( 'unvote-this' );

							// First vote.
							if ( dotinsights.VotedProjects.length < 1 ) {
								var $modalFirstVote = $( '#modal-first-vote-notice' ),
								    $shareButton    = $modalFirstVote.find( '.btn-twitter-share' ),
								    projectName     = $thisButton.closest( '.row-project' ).find( '.project-name' ).text(),
								    text            = `I love ${projectName} so much I voted for this project on the @Polkadot and @Kusamanetwork Ecosystem Map by @dotinsights_xyz! What about you? Come vote for your favorite projects and earn a free NFT🎉`,
								    url             = 'https://twitter.com/intent/tweet?text={text}&url={url}';

								url = url.replace( '{text}', encodeURI( text ) );
								url = url.replace( '{url}', encodeURI( location.origin + '/most-loved-projects/' ) );

								$shareButton.attr( 'href', url );

								$modalFirstVote.dotinsightsModal( 'open' );
							}

							if ( dotinsights.VotedProjects.indexOf( projectID ) === - 1 ) {
								dotinsights.VotedProjects.push( projectID );
							}
						} else {
							$theVoteButtons.removeClass( 'unvote-this' ).addClass( 'vote-this' );

							var index = dotinsights.VotedProjects.indexOf( projectID );
							if ( index > - 1 ) {
								dotinsights.VotedProjects.splice( index, 1 );
							}
						}
					} else {
						var $modalVoteError = $( '#modal-vote-error' ),
						    errorMessages   = response.message ? response.message : 'Something went wrong!';

						$modalVoteError.find( '.vote-error-message' ).text( errorMessages );
						$modalVoteError.dotinsightsModal( 'open' );
					}
				} catch ( e ) {
					Helpers.unsetElementHandling( $thisButton );
				}
			} else {
				$modalConnectWallet.dotinsightsModal( 'open' );
			}
		} );

		// Switching wallet account.
		$( document.body ).on( 'click', '.wallet-account-address', async function( evt ) {
			evt.preventDefault();

			if ( ! $( this ).hasClass( 'selected-account' ) ) {
				// Get account list.
				const accountList = await walletUtils.getAccounts();
				var newAccount = $( this ).data( 'address' );

				for ( var i = 0; i < accountList.length; i ++ ) {
					if ( newAccount === accountList[ i ].address ) {
						walletUtils.enableAccount( newAccount );

						$( this ).siblings().removeClass( 'selected-account' );
						$( this ).addClass( 'selected-account' );

						$( '.btn-open-connect-wallet' ).find( '.button-text span' ).text( accountList[ i ].name );
						refreshVoteCount( newAccount );
						$modalConnectWallet.dotinsightsModal( 'close' );

						break;
					}
				}
			}
		} );

		$( document.body ).on( 'dotinsights/VotedProjects/Refreshed', function() {
			$( '.btn-vote' ).addClass( 'vote-this' ).removeClass( 'unvote-this' );

			if ( dotinsights.VotedProjects.length > 0 ) {
				for ( var i = 0; i < dotinsights.VotedProjects.length; i ++ ) {
					var $thisButton = $( '.btn-vote[data-project-id="' + dotinsights.VotedProjects[ i ] + '"]' );
					$thisButton.removeClass( 'vote-this' ).addClass( 'unvote-this' );
				}
			}
		} );

		function renderWalletArea() {
			setTimeout( async function() {
				// Load saved state.
				walletUtils.loadSavedState();

				try {
					// Auto connect with wallet is has connected before.
					const isConnectedWithWallet = await walletUtils.isConnectedWithWallet();
					if ( isConnectedWithWallet ) {
						// Connect with wallet
						await walletUtils.enableWallet( walletUtils.currentWalletName );

						// Get account list.
						var accounts = await walletUtils.getAccounts();

						// Display current account.
						var currentAddress = await walletUtils.currentAddress;
						var currentAccount = null;
						var output = '';

						for ( var i = 0; i < accounts.length; i ++ ) {
							var thisAccount = accounts[ i ],
							    itemClass   = 'wallet-account-address';

							if ( thisAccount.address === currentAddress ) {
								itemClass += ' selected-account';
								currentAccount = thisAccount;
							}

							output += `<div class="${itemClass}" data-address="${thisAccount.address}">
									<div class="wallet-icon"></div>
	                                <div id="wallet-info">
	                                    <div class="wallet-name text-1-row"><span>${thisAccount.name}</span></div>
	                                    <div class="wallet-address text-1-row"><span>${thisAccount.address}</span></div>
	                                </div>
								</div>`;
						}

						output += `<div class="button-wrap btn-disconnect-wallet-wrap"><a href="#" class="button btn-disconnect-wallet"><span class="button-text">Disconnect</span></a></div>`;

						$( '.btn-open-connect-wallet' ).find( '.button-text span' ).text( currentAccount.name );
						$modalConnectWallet.find( '.modal-title' ).text( 'Choose account' );
						$modalConnectWalletContent.empty().html( output );

						refreshVoteCount( currentAddress );
					} else {
						renderWalletWhenNotConnected();
					}
				} catch ( e ) {
					console.error( 'Connect wallet error: ' + e.message );
					renderWalletWhenNotConnected();
				}
			}, 500 );
		}

		function renderWalletWhenNotConnected() {
			var output = '';

			for ( var walletKey in walletUtils.supportedWallets ) {
				var wallet        = walletUtils.supportedWallets[ walletKey ],
				    isInstalled   = walletUtils.isInstall( walletKey ),
				    btnUrl        = isInstalled ? '#' : wallet.getInstallUrl(),
				    btnAttributes = isInstalled ? '' : ' target="_blank"',
				    btnIcon       = isInstalled ? '' : '<span class="button-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.0625 10.3135L12 14.2499L15.9375 10.3135" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3.75V14.2472" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.25 14.25V19.5C20.25 19.6989 20.171 19.8897 20.0303 20.0303C19.8897 20.171 19.6989 20.25 19.5 20.25H4.5C4.30109 20.25 4.11032 20.171 3.96967 20.0303C3.82902 19.8897 3.75 19.6989 3.75 19.5V14.25" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
				    btnCssClass   = 'button button--wallet wallet--' + walletKey;

				btnCssClass += isInstalled ? ' btn-connect-wallet' : ' button-right-icon btn-install-wallet';

				output += `<a data-wallet="${walletKey}" href="${btnUrl}" class="${btnCssClass}" ${btnAttributes}><span class="button-text">${wallet.name}</span>${btnIcon}</a>`
			}

			$( '.btn-open-connect-wallet' ).find( '.button-text span' ).text( 'Connect Wallet' );
			$modalConnectWalletContent.empty().html( output );
			$modalConnectWallet.find( '.modal-title' ).text( 'Connect Your Wallet' );
		}

		function refreshVoteCount( address ) {
			$.ajax( {
				method: 'POST',
				url: Helpers.getApiEndpointUrl( 'getVotedProject' ),
				data: {
					address: address
				},
				success: function( projects ) {
					dotinsights.VotedProjects = projects;
					$( document.body ).trigger( 'dotinsights/VotedProjects/Refreshed' );
				},
			} );
		}
	}( jQuery )
);
