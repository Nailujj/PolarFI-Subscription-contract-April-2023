# PolarFI-Subscription-contract-April-2023

This is the ERC-721 subscription contract i built for Polarfi.io. It includes a referral system and is fully automated using a chainlink automation integration. To integrate it yourself, you need to register an upkeep here: https://automation.chain.link/ and need to have some $Link in your wallet. The checkUpKeep() function runs off chain until the condition is true. Then it updates the isSubscribed mapping for the corresponding token and adjusts its metadata.

You can use any token you would like for minting. $USDC is just my prefered stableCoin. Also note, that this is currently desinged for a betatest on testnet, meaning that you need to adjust the tokendecimals of USDC before deploying on mainnet (x*10**18 --> x*10**6). You can test it here: https://testnet.bscscan.com/address/0x070Fe5375F1A20BF3F518fc724537480E1dA9e36#code
(sub-duration is set to 1 day and safeMint() as well as resubscribe() costs are set to 0, so no need for USDC).

This contract differs from the basic contract i uploaded in february because the "old" one was (as stated in the README) very restricted in the functionality as it worked without using metadata. Now, this contract can be used e.g. with the collab.land bot that is widely used for web3 discord communities.
