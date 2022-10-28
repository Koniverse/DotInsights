!function(n){"use strict";window.DotInsights=window.DotInsights||{},DotInsights.Wallet={isInstalled:!1,isConnected:!1};const o="userAccount";var a=n("#modal-connect-wallet"),e=a.find(".modal-content-body");a.DotInsightsModal(),n(document).ready(function(){t()}),n(document.body).on("click",".btn-connect-subwallet",function(t){t.preventDefault(),setTimeout(async()=>{var t,e,s=window.injectedWeb3&&window.injectedWeb3["subwallet-js"];s?(e=(t=await(s=await s.enable().catch(()=>{alert("User cancel or reject connect request")})).accounts.get())[1].address,console.log(t),t=await async function(t){t=await i("https://dot-insights-api.subwallet.app/api/getMessage",{address:t});return t.message}(e),console.log("SignMessage:",t),e={selectedAccountAddress:e,signature:(s=await s.signer.signRaw({address:e,data:t})).signature},window.localStorage.setItem(o,JSON.stringify(e)),console.log("Signature:",s.signature)):alert("SubWallet extension is not installed")},300)}),n(document.body).on("click",".btn-like",function(t){t.preventDefault();var e,t=n(this),s=t.data("project-id"),t=t.hasClass("like-this");a.DotInsightsModal("open"),DotInsights.Wallet.isConnected?(e=async function(t,e,s,n){return i("https://dot-insights-api.subwallet.app/api/voteProject",{project_id:s,address:t,signature:e,isVote:n})}((e=JSON.parse(localStorage.getItem(o))).selectedAccountAddress,e.signature,s,t),console.log("Voted Rs",e)):a.DotInsightsModal("open")});const t=()=>{var t;DotInsights.Wallet.isInstalled=Boolean(window.injectedWeb3&&window.SubWallet),DotInsights.Wallet.isConnected=s(),DotInsights.Wallet.isInstalled?DotInsights.Wallet.isInstalled&&!DotInsights.Wallet.isConnected?(e.empty(),e.html(`
					<a href="#" target="_blank" class="button button-right-icon btn-connect-subwallet">
						<span class="button-text">SubWallet</span>
					</a>`)):(t=JSON.parse(localStorage.getItem(o)),l(t),console.log(l)):(t="https://bit.ly/3BGqFt1",DotInsights.BrowserUtil.isFirefox&&(t="https://mzl.la/3rQ0awW"),e.empty(),e.html(`
					<a href="${t}" target="_blank" class="button button-right-icon btn-install-subwallet">
						<span class="button-text">SubWallet</span>
						<span class="button-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.0625 10.3135L12 14.2499L15.9375 10.3135" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3.75V14.2472" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.25 14.25V19.5C20.25 19.6989 20.171 19.8897 20.0303 20.0303C19.8897 20.171 19.6989 20.25 19.5 20.25H4.5C4.30109 20.25 4.11032 20.171 3.96967 20.0303C3.82902 19.8897 3.75 19.6989 3.75 19.5V14.25" stroke="#66E1B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
					</a>
				`))},s=()=>{return!!JSON.parse(localStorage.getItem(o))},l=(t=null)=>{t=`<div class="connected-wallet-info-card">
                                    <div class="card-title">
                                        Connect successfully with subwallet
                                    </div>
                                    <div class="card-body">
                                        <div class="wallet-address-heading">
                                            <div>Your address: </div>
                                        </div>
                                        <div class="wallet-address">
                                            <div class="wallet-icon"></div>
                                            <div id="wallet-account-address"><span>${(t||JSON.parse(localStorage.getItem(o))).account}</span></div>
                                            <span class="logout-connect-subwallet button" id="logout-btn">
                                                Log out
                                            </span>
                                        </div>
                                    </div>
                                    <a href="#gleam-competition" class="scroll-to go-to-gleam-competition"></a>
                                </div>`;e.empty().html(t)};async function i(n,o){return new Promise((t,e)=>{const s=new XMLHttpRequest;s.open("POST",n),s.setRequestHeader("Accept","application/json"),s.setRequestHeader("Content-Type","application/json"),s.onload=()=>{t(JSON.parse(s.responseText))};try{s.send(JSON.stringify(o))}catch(t){console.error(t),e(t)}})}}(jQuery);