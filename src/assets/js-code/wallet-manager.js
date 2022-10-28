(
	function( $ ) {
		'use strict';

		window.DotInsights = window.DotInsights || {};
		DotInsights.Wallet = {
			isInstalled: false,
			isConnected: false
		};
		var Helpers = DotInsights.Helpers;

		const USER_LS_KEY = 'userAccount';

		var $modalConnectWallet        = $( '#modal-connect-wallet' ),
		    $modalConnectWalletContent = $modalConnectWallet.find( '.modal-content-body' );

		$modalConnectWallet.DotInsightsModal(); // Init modal.

		console.log( 'Ver 3.0' );

		$( document ).ready( function() {
			renderWalletArea();
		} );

		$( document.body ).on( 'click', '.btn-connect-subwallet', function( evt ) {
			evt.preventDefault();

			connectSubWallet();
		} );

		$( document.body ).on( 'click', '.btn-logout-subwallet', logoutSubWallet );

		$( document.body ).on( 'click', '.btn-vote', function( evt ) {
			evt.preventDefault();

			var $thisButton = $( this ),
			    projectID   = $thisButton.data( 'project-id' ),
			    doVote      = $thisButton.hasClass( 'vote-this' );

			if ( DotInsights.Wallet.isConnected ) {
				const wallet = JSON.parse( localStorage.getItem( USER_LS_KEY ) );

				const voteRs = voteProject( wallet.selectedAccountAddress, wallet.signature, projectID, doVote );
				console.log( 'Voted Rs', voteRs );
			} else {
				$modalConnectWallet.DotInsightsModal( 'open' );
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
				$modalConnectWalletContent.html(
					`
					<a href="#" target="_blank" class="button button-right-icon btn-connect-subwallet">
						<span class="button-text">SubWallet</span>
					</a>`
				)
			} else { // Render list account.
				const wallet = JSON.parse( localStorage.getItem( USER_LS_KEY ) );
				onSuccessfullyConnect( wallet );

				console.log( onSuccessfullyConnect );
			}
		};

		const checkConnectedWallet = () => {
			const userData = JSON.parse( localStorage.getItem( USER_LS_KEY ) );
			return ! ! userData;
		};

		const onSuccessfullyConnect = ( wallet = null ) => {
			const walletInfo = wallet || JSON.parse( localStorage.getItem( USER_LS_KEY ) );
			const html = `<div class="connected-wallet-info-card">
								<div class="wallet-address-heading">Your address:</div>
                                <div class="wallet-address">
                                    <div class="wallet-icon"></div>
                                    <div id="wallet-account-address"><span>${walletInfo.selectedAccountAddress}</span></div>
                                    <a href="#" class="button btn-logout-subwallet"><span class="button-text">Log out</span></a>
                                </div>
							</div>`;

			$modalConnectWalletContent.empty();
			$modalConnectWalletContent.html( html );

			// Append status for all projects.
			/*var votedProjects = await sendPost( Helpers.getApiEndpointUrl( 'getVotedProject' ), {
				address: walletInfo.selectedAccountAddress
			} );*/

			// Get Dot accounts.
			$.ajax( {
				method: 'POST',
				url: Helpers.getApiEndpointUrl( 'getVotedProject' ),
				data: JSON.stringify( {
					address: walletInfo.selectedAccountAddress
				} ),
				success: function( projects ) {
					if ( projects.length > 0 ) {
						for ( var i = 0; i < projects.length; i ++ ) {
							$( '.btn-vote[data-project-id="' + projects[ i ] + '"]' ).removeClass( 'vote-this' ).addClass( 'unvote-this' );
						}
					}
				},
			} );
		};

		function getWallet( walletName ) {
			return window.injectedWeb3 && window.injectedWeb3[ walletName ];
		}

		function connectSubWallet() {
			setTimeout( async () => {
				const wallet = getWallet( 'subwallet-js' );
				if ( wallet ) {
					// Connect to the wallet.
					const activeWallet = await wallet.enable().catch( () => {
						alert( 'User cancel or reject connect request' )
					} );

					// Get and select accounts.
					const accounts = await activeWallet.accounts.get();
					console.log( activeWallet );
					console.log( accounts );
					const selectedAccountAddress = accounts[ 0 ][ 'address' ];

					console.log( accounts );

					// get signMessage and vote.
					const signMessage = await getSignMessage( selectedAccountAddress );
					console.log( 'SignMessage:', signMessage );
					const signatureRs = await activeWallet.signer.signRaw( {
						address: selectedAccountAddress,
						data: signMessage
					} );

					var info = {
						selectedAccountAddress: selectedAccountAddress,
						signature: signatureRs.signature
					};

					window.localStorage.setItem( USER_LS_KEY, JSON.stringify( info ) );

					console.log( 'Signature:', signatureRs.signature );
				} else {
					alert( 'SubWallet extension is not installed' )
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

		async function voteProject( address, signature, project_id, isVote ) {
			return await sendPost( Helpers.getApiEndpointUrl( 'voteProject' ), {
				project_id,
				address,
				signature,
				isVote
			} );
		}
	}( jQuery )
);
