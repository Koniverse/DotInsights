(
	function( $ ) {
		'use strict';

		window.dotinsights = window.dotinsights || {};
		dotinsights.VotedProjects = [];
		var Helpers = dotinsights.Helpers;

		const USER_LS_KEY = 'walletInfo';

		var $modalConnectWallet        = $( '#modal-connect-wallet' ),
		    $modalConnectWalletContent = $modalConnectWallet.find( '.modal-content-body' );

		$modalConnectWallet.dotinsightsModal(); // Init modal.

		$( document ).ready( function() {
			$( document.body ).on( 'click', '#btn-connect-subwallet', function( evt ) {
				evt.preventDefault();

				connectSubWallet( $( this ) );
			} );

			renderWalletArea();
		} );

		$( document.body ).on( 'click', '.btn-logout-subwallet', logoutSubWallet );

		var votingAvailableTime = Date.UTC( 2022, 10, 18, 12, 0, 0 );
		var modalVoteComing = $( '#modal-vote-coming' );
		$( document.body ).on( 'click', '.btn-vote', function( evt ) {
			evt.preventDefault();

			if ( votingAvailableTime > Date.now() ) {
				modalVoteComing.dotinsightsModal( 'open' );
				return;
			}

			var $thisButton = $( this ),
			    projectID   = $thisButton.data( 'project-id' );

			if ( isSubWalletConnected() ) {
				const walletInfo = getWalletInfo();
				Helpers.setElementHandling( $thisButton );

				async function doVote() {
					try {
						const signature = await getVotingSignature( walletInfo.selectedAccountAddress, projectID );

						if ( false === signature ) {
							throw 'Invalid signature';
						}

						const response = await sendPost( Helpers.getApiEndpointUrl( 'toggleVoteProject' ), {
							project_id: projectID,
							address: walletInfo.selectedAccountAddress,
							signature: signature
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
									    text            = `I love ${projectName} so much I voted for this project on the @Polkadot and @Kusamanetwork Ecosystem Map by @dotinsights! What about you? Come vote for your favorite projects and earn a free NFT🎉`,
									    url             = 'https://twitter.com/share?text={text}&amp;url={url}';

									url = url.replace( '{text}', text );
									url = url.replace( '{url}', location.origin );

									$shareButton.attr( 'href', encodeURI( url ) );

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
				}
				doVote();
			} else {
				$modalConnectWallet.dotinsightsModal( 'open' );
			}
		} );

		// Switching wallet account.
		$( document.body ).on( 'click', '.wallet-account-address', function( evt ) {
			evt.preventDefault();

			if ( ! $( this ).hasClass( 'selected-account' ) ) {
				var newAccount = $( this ).data( 'address' );

				try {
					var walletInfo = getWalletInfo();
					for ( var i = 0; i < walletInfo.accounts.length; i ++ ) {
						if ( newAccount === walletInfo.accounts[ i ].address ) {
							walletInfo.selectedAccountAddress = newAccount;
							walletInfo.selectedAccount = walletInfo.accounts[ i ];
							setWalletInfo( walletInfo );

							$( this ).siblings().removeClass( 'selected-account' );
							$( this ).addClass( 'selected-account' );

							$modalConnectWallet.dotinsightsModal( 'close' );

							$( '.btn-open-connect-wallet' ).find( '.button-text span' ).text( walletInfo.selectedAccount.name );
							refreshVoteCount( newAccount );
							break;
						}
					}
				} catch ( e ) {
					console.error( e );
				}
			}
		} );

		const renderWalletArea = () => {
			if ( isSubWalletInstalled() ) {
				if ( ! isSubWalletConnected() ) { // Render connect button.
					$modalConnectWalletContent.empty();
					$modalConnectWalletContent.html( `
						<a href="#" target="_blank" class="button button-right-icon btn-install-connect-wallet" id="btn-connect-subwallet">
							<span class="button-text">SubWallet</span>
						</a>
					` );
					$( '.btn-open-connect-wallet' ).find( '.button-text span' ).text( 'Connect Wallet' );
					$modalConnectWallet.find( '.modal-title' ).text( 'Connect Your Wallet' );
				} else { // Render list account.
					const walletInfo = getWalletInfo();
					var html = '';

					if ( walletInfo && typeof walletInfo.accounts !== 'undefined' && walletInfo.accounts.length > 0 ) {
						for ( var i = 0; i < walletInfo.accounts.length; i ++ ) {
							var thisAccount = walletInfo.accounts[ i ];
							var itemClass = 'wallet-account-address';
							itemClass += thisAccount.address === walletInfo.selectedAccountAddress ? ' selected-account' : '';

							html += `<div class="${itemClass}" data-address="${thisAccount.address}">
									<div class="wallet-icon"></div>
	                                <div id="wallet-info">
	                                    <div class="wallet-name">${thisAccount.name}</div>
	                                    <div class="wallet-address"><span>${thisAccount.address}</span></div>
	                                </div>
								</div>`;
						}

						html += `<div class="button-wrap btn-logout-subwallet-wrap"><a href="#" class="button btn-logout-subwallet"><span class="button-text">Disconnect</span></a></div>`;
					} else {
						html = '<div>There is not any accounts found.</div>';
					}

					if ( typeof walletInfo.selectedAccount.name !== 'undefined' ) {
						$( '.btn-open-connect-wallet' ).find( '.button-text span' ).text( walletInfo.selectedAccount.name );
					}

					$modalConnectWallet.find( '.modal-title' ).text( 'Choose account' );
					$modalConnectWalletContent.empty();
					$modalConnectWalletContent.html( html );

					refreshVoteCount( walletInfo.selectedAccountAddress );
				}
			} else { // Render install link.
				// Chrome, Brave, MS Edge.
				var get_extension_link = 'https://bit.ly/3BGqFt1';

				if ( dotinsights.BrowserUtil.isFirefox ) {
					get_extension_link = 'https://mzl.la/3rQ0awW';
				}

				$modalConnectWalletContent.empty();
				$modalConnectWalletContent.html( `
					<a href="${get_extension_link}" target="_blank" class="button button-right-icon btn-install-connect-wallet">
						<span class="button-text">SubWallet</span>
						<span class="button-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.0625 10.3135L12 14.2499L15.9375 10.3135" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3.75V14.2472" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.25 14.25V19.5C20.25 19.6989 20.171 19.8897 20.0303 20.0303C19.8897 20.171 19.6989 20.25 19.5 20.25H4.5C4.30109 20.25 4.11032 20.171 3.96967 20.0303C3.82902 19.8897 3.75 19.6989 3.75 19.5V14.25" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
					</a>
				` );
			}
		};

		const isSubWalletConnected = () => {
			try {
				const walletInfo = getWalletInfo();

				if ( ! walletInfo.hasOwnProperty( 'selectedAccount' ) ) {
					return false;
				}

				return ! ! walletInfo;
			} catch ( e ) {
				return false;
			}
		};

		$( document.body ).on( 'dotinsights/VotedProjects/Refreshed', function() {
			$( '.btn-vote' ).addClass( 'vote-this' ).removeClass( 'unvote-this' );

			if ( dotinsights.VotedProjects.length > 0 ) {
				for ( var i = 0; i < dotinsights.VotedProjects.length; i ++ ) {
					var $thisButton = $( '.btn-vote[data-project-id="' + dotinsights.VotedProjects[ i ] + '"]' );
					$thisButton.removeClass( 'vote-this' ).addClass( 'unvote-this' );
				}
			}
		} );

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

		function getWallet( walletName = 'subwallet-js' ) {
			return window.injectedWeb3 && window.injectedWeb3[ walletName ];
		}

		function isSubWalletInstalled() {
			return typeof window.injectedWeb3 !== 'undefined' && typeof window.injectedWeb3[ 'subwallet-js' ] !== 'undefined';
		}

		function connectSubWallet( $thisButton ) {
			const wallet = getWallet();
			if ( wallet ) {
				Helpers.setElementHandling( $thisButton );

				setTimeout( async function() {
					try {
						// Connect to the wallet.
						dotinsights.ActiveWallet = await wallet.enable().catch( () => {
							alert( 'User cancel or reject connect request' );
							throw 'User cancel or reject connect request';
						} );

						// Get and select accounts.
						const accounts = await dotinsights.ActiveWallet.accounts.get();
						const selectedAccountAddress = accounts[ 0 ][ 'address' ];

						var info = {
							accounts: accounts,
							selectedAccount: accounts[ 0 ],
							selectedAccountAddress: selectedAccountAddress,
						};

						setWalletInfo( info );

						renderWalletArea();
					} catch ( e ) {
						console.error( e );
						Helpers.unsetElementHandling( $thisButton );
					}
				}, 500 );
			} else {
				alert( 'SubWallet extension is not installed' );
			}
		}

		function logoutSubWallet( evt ) {
			var $thisButton = $( evt.currentTarget );

			Helpers.setElementHandling( $thisButton );

			setTimeout( async function() {
				window.localStorage.removeItem( USER_LS_KEY );

				renderWalletArea();
			}, 500 );
		}

		function setWalletInfo( info ) {
			window.localStorage.setItem( USER_LS_KEY, JSON.stringify( info ) );
		}

		function getWalletInfo() {
			return JSON.parse( localStorage.getItem( USER_LS_KEY ) );
		}

		async function sendPost( url, data ) {
			return new Promise( ( resolve, reject ) => {
				const xhr = new XMLHttpRequest();
				xhr.open( "POST", url );

				xhr.setRequestHeader( "Accept", "application/json" );
				xhr.setRequestHeader( "Content-Type", "application/json" );

				xhr.onload = () => {
					resolve( JSON.parse( xhr.responseText ) )
				};

				try {
					xhr.send( JSON.stringify( data ) );
				} catch ( e ) {
					console.error( e );
					reject( e );
				}
			} )
		}

		async function getSignMessage( address ) {
			const rs = await sendPost( Helpers.getApiEndpointUrl( 'getMessage' ), { address } );
			return rs[ 'message' ];
		}

		async function getVotingSignature( address, projectID ) {
			try {
				const walletInfo = getWalletInfo();
				var signMessage = '';

				for ( var i = 0; i < walletInfo.accounts.length; i ++ ) {
					if ( walletInfo.accounts[ i ].address === address ) {
						if ( walletInfo.accounts[ i ].hasOwnProperty( 'signMessage' ) ) {
							signMessage = walletInfo.accounts[ i ][ 'signMessage' ];
						} else {
							signMessage = await getSignMessage( address );
							walletInfo.accounts[ i ][ 'signMessage' ] = signMessage;
							setWalletInfo( walletInfo );
						}
						break;
					}
				}

				signMessage += '-' + projectID;

				if ( typeof dotinsights.ActiveWallet === 'undefined' ) {
					const wallet = getWallet();
					if ( wallet ) {
						dotinsights.ActiveWallet = await wallet.enable().catch( () => {
							alert( 'User cancel or reject connect request' );
							throw 'User cancel or reject connect request';
						} );
					}
				}

				const signatureRs = await dotinsights.ActiveWallet.signer.signRaw( {
					address: address,
					data: signMessage
				} );

				return signatureRs.signature;
			} catch ( e ) {
				console.error( e );
			}

			return false;
		}
	}( jQuery )
);
