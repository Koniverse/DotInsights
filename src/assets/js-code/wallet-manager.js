(
	function( $ ) {
		'use strict';

		window.DotInsights = window.DotInsights || {};
		DotInsights.Wallet = {
			isInstalled: false,
			isConnected: false
		};
		DotInsights.VotedProjects = [];
		var Helpers = DotInsights.Helpers;

		const USER_LS_KEY = 'walletInfo';

		var $modalConnectWallet        = $( '#modal-connect-wallet' ),
		    $modalConnectWalletContent = $modalConnectWallet.find( '.modal-content-body' );

		$modalConnectWallet.DotInsightsModal(); // Init modal.

		$( document ).ready( function() {
			setTimeout( async () => {
				const wallet = getWallet( 'subwallet-js' );
				if ( wallet ) {
					// Connect to the wallet.
					DotInsights.ActiveWallet = await wallet.enable().catch( () => {
						alert( 'User cancel or reject connect request' )
					} );
				}
			} );
			$( document.body ).on( 'click', '.btn-connect-subwallet', function( evt ) {
				evt.preventDefault();

				connectSubWallet();
			} );
			renderWalletArea();
		} );

		$( document.body ).on( 'click', '.btn-logout-subwallet', logoutSubWallet );

		$( document.body ).on( 'click', '.btn-vote', function( evt ) {
			evt.preventDefault();

			var $thisButton = $( this ),
			    projectID   = $thisButton.data( 'project-id' );

			if ( DotInsights.Wallet.isConnected ) {
				const walletInfo = JSON.parse( localStorage.getItem( USER_LS_KEY ) );
				Helpers.setElementHandling( $thisButton );

				//const signature = getVotingSignature( walletInfo.selectedAccountAddress, projectID );
				async function doVote() {
					try {
						var response = await voteProject( walletInfo.selectedAccountAddress, projectID );
						Helpers.unsetElementHandling( $thisButton );

						DotInsights.Projects = DotInsights.Projects.map( obj =>
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
							if ( DotInsights.VotedProjects.length < 1 ) {
								$( '#modal-first-vote-notice' ).DotInsightsModal( 'open' );
							}

							if ( DotInsights.VotedProjects.indexOf( projectID ) === - 1 ) {
								DotInsights.VotedProjects.push( projectID );
							}
						} else {
							$theVoteButtons.removeClass( 'unvote-this' ).addClass( 'vote-this' );

							var index = DotInsights.VotedProjects.indexOf( projectID );
							if ( index > - 1 ) {
								DotInsights.VotedProjects.splice( index, 1 );
							}
						}
					} catch ( e ) {
						Helpers.unsetElementHandling( $thisButton );
					}
				}
				doVote();
			} else {
				$modalConnectWallet.DotInsightsModal( 'open' );
			}
		} );

		// Switching wallet account.
		$( document.body ).on( 'click', '.wallet-account-address', function( evt ) {
			evt.preventDefault();

			if ( ! $( this ).hasClass( 'selected-account' ) ) {
				var newAccount = $( this ).data( 'address' );

				try {
					var walletInfo = JSON.parse( localStorage.getItem( USER_LS_KEY ) );
					for ( var i = 0; i < walletInfo.accounts.length; i ++ ) {
						if ( newAccount === walletInfo.accounts[ i ].address ) {
							walletInfo.selectedAccountAddress = newAccount;
							walletInfo.selectedAccount = walletInfo.accounts[ i ];
							localStorage.setItem( USER_LS_KEY, JSON.stringify( walletInfo ) );

							$( this ).siblings().removeClass( 'selected-account' );
							$( this ).addClass( 'selected-account' );

							$modalConnectWallet.DotInsightsModal( 'close' );

							$( '.btn-open-connect-wallet' ).find( '.button-text span' ).text( walletInfo.selectedAccount.name );
							refreshVoteCount( newAccount );
							break;
						}
					}
				} catch ( e ) {
					console.log( e );
				}
			}
		} );

		const renderWalletArea = () => {
			DotInsights.Wallet.isInstalled = Boolean( window.injectedWeb3 && window.SubWallet );
			DotInsights.Wallet.isConnected = checkConnectedWallet();

			if ( ! DotInsights.Wallet.isInstalled ) { // Render install link.
				// Chrome, Brave, MS Edge.
				var get_extension_link = 'https://bit.ly/3BGqFt1';

				if ( DotInsights.BrowserUtil.isFirefox ) {
					get_extension_link = 'https://mzl.la/3rQ0awW';
				}

				$modalConnectWalletContent.empty();
				$modalConnectWalletContent.html( `
					<a href="${get_extension_link}" target="_blank" class="button button-right-icon btn-install-subwallet">
						<span class="button-text">SubWallet</span>
						<span class="button-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.0625 10.3135L12 14.2499L15.9375 10.3135" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3.75V14.2472" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.25 14.25V19.5C20.25 19.6989 20.171 19.8897 20.0303 20.0303C19.8897 20.171 19.6989 20.25 19.5 20.25H4.5C4.30109 20.25 4.11032 20.171 3.96967 20.0303C3.82902 19.8897 3.75 19.6989 3.75 19.5V14.25" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
					</a>
				` );
			} else if ( DotInsights.Wallet.isInstalled && ! DotInsights.Wallet.isConnected ) { // Render connect button.
				$modalConnectWalletContent.empty();
				$modalConnectWalletContent.html( `
					<a href="#" target="_blank" class="button button-right-icon btn-connect-subwallet">
						<span class="button-text">SubWallet</span>
					</a>
				` );
			} else { // Render list account.
				const wallet = JSON.parse( localStorage.getItem( USER_LS_KEY ) );
				onSuccessfullyConnect( wallet );
			}
		};

		const checkConnectedWallet = () => {
			try {
				const walletInfo = JSON.parse( localStorage.getItem( USER_LS_KEY ) );

				if ( ! walletInfo.hasOwnProperty( 'selectedAccount' ) ) {
					return false;
				}

				return ! ! walletInfo;
			} catch ( e ) {
				return false;
			}
		};

		const onSuccessfullyConnect = ( wallet = null ) => {
			const walletInfo = wallet || JSON.parse( localStorage.getItem( USER_LS_KEY ) );
			var html = '';
			for ( var i = 0; i < walletInfo.accounts.length; i ++ ) {
				var thisAccount = walletInfo.accounts[ i ];
				var itemClass = 'wallet-account-address';
				itemClass += thisAccount.address === walletInfo.selectedAccountAddress ? ' selected-account' : '';

				html += `<div class="${itemClass}" data-address="${thisAccount.address}">
								<div class="wallet-icon"><img src="./assets/images/wallet-icon.png" alt=""></div>
                                <div id="wallet-info">
                                    <div class="wallet-name">${thisAccount.name}</div>
                                    <div class="wallet-address"><span>${thisAccount.address}</span></div>
                                </div>
							</div>`;
			}
			//html += `<a href="#" class= "class=button btn-confirm-switch-account-address"><span class="button-text">Confirm</span></a>\`;                                                                                                                                                                                                                                                                                                                                                               "button btn-confirm-wallet-account-chain"><span class="button-text">Log out</span></a>`;
			//html += `<a href="#" class="button btn-logout-subwallet"><span class="button-text">Log out</span></a>`;

			$( '.btn-open-connect-wallet' ).find( '.button-text span' ).text( walletInfo.selectedAccount.name );
			$modalConnectWallet.find( '.modal-title' ).text( 'Choose account' );
			$modalConnectWalletContent.empty();
			$modalConnectWalletContent.html( html );

			// Append status for all projects.
			/*var votedProjects = await sendPost( Helpers.getApiEndpointUrl( 'getVoteCount' ), {
				address: walletInfo.selectedAccountAddress
			} );*/

			refreshVoteCount( walletInfo.selectedAccountAddress );
		};

		$( document.body ).on( 'DotInsights/VotedProjects/Refreshed', function() {
			$( '.btn-vote' ).addClass( 'vote-this' ).removeClass( 'unvote-this' );

			if ( DotInsights.VotedProjects.length > 0 ) {
				for ( var i = 0; i < DotInsights.VotedProjects.length; i ++ ) {
					var $thisButton = $( '.btn-vote[data-project-id="' + DotInsights.VotedProjects[ i ] + '"]' );
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
					DotInsights.VotedProjects = projects;
					$( document.body ).trigger( 'DotInsights/VotedProjects/Refreshed' );
				},
			} );
		}

		function getWallet( walletName ) {
			return window.injectedWeb3 && window.injectedWeb3[ walletName ];
		}

		function connectSubWallet() {
			setTimeout( async () => {
				const wallet = getWallet( 'subwallet-js' );
				if ( wallet ) {
					// Get and select accounts.
					const accounts = await DotInsights.ActiveWallet.accounts.get();
					const selectedAccountAddress = accounts[ 0 ][ 'address' ];

					var info = {
						accounts: accounts,
						selectedAccount: accounts[ 0 ],
						selectedAccountAddress: selectedAccountAddress,
					};

					window.localStorage.setItem( USER_LS_KEY, JSON.stringify( info ) );

					renderWalletArea();
				} else {
					alert( 'SubWallet extension is not installed' );
				}
			}, 300 ); // Wait a small amount time to ensure wallet is initialized.
		}

		function logoutSubWallet() {
			window.localStorage.removeItem( USER_LS_KEY );
			renderWalletArea();
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
			// get signMessage and vote.
			var signMessage = await getSignMessage( address );

			signMessage += '-' + projectID;

			const signatureRs = await DotInsights.ActiveWallet.signer.signRaw( {
				address: address,
				data: signMessage
			} );

			return signatureRs.signature;
		}

		async function voteProject( address, project_id ) {
			const signature = await getVotingSignature( address, project_id );

			return await sendPost( Helpers.getApiEndpointUrl( 'toggleVoteProject' ), {
				project_id,
				address,
				signature
			} );
		}
	}( jQuery )
);
