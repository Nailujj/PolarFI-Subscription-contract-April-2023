import { time } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs.js";
import { expect } from "chai";
import { extendEnvironment } from "hardhat/config.js";
import { BigNumber } from "ethers";

describe("Subscription", function () {
  it("should initialize the minting and the token mappings correctly", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, otherAccount] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.deploy();

    await contract.setTokenAddress(USDc.address);

    await contract.connect(otherAccount).safeMint();
    let supply  = await contract.totalSupply();
    expect(supply).to.equal(1);

    const mintTime = await contract.idToTime(0);
    const RealmintTime = mintTime.toNumber();
    const nowTime = await time.latest();
    expect(mintTime).to.equal(nowTime);
  });

  it("Should return needCheckup false, if 35 days havent passed", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, wallet1, wallet2] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.deploy();
    await contract.setTokenAddress(USDc.address);

    //minting different nfts on different days
    await contract.connect(wallet1).safeMint();
    await time.increase(60*60);
    await contract.connect(wallet2).safeMint();
    await time.increase(60*60*24);

    const needCheckup = await contract.connect(owner).checkUpkeep2();
    expect(needCheckup).to.be.false; 
  });


  it("Should return needCheckup true, if 35 days have passed", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, wallet1, wallet2] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.deploy();
    await contract.setTokenAddress(USDc.address);

    //minting different nfts on different days
    await contract.connect(wallet1).safeMint();
    await time.increase(60*60*48)
    await contract.connect(wallet2).safeMint();

    await time.increase(36*24*60*60);
    const needCheckup2 = await contract.connect(owner).checkUpkeep2();
    expect(needCheckup2).to.be.true;
  });


  it("Should update the subscription status if the subscription has expired", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, wallet1, wallet2, wallet3] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.deploy();
    await contract.setTokenAddress(USDc.address);

    
    await contract.connect(wallet1).safeMint();
    const boolSubscribed = await contract.isSubscribed(0);
    expect(boolSubscribed).to.be.true;
    

    await time.increase(36*24*60*60);
    const tokenIdOfHolder = await contract.addressToId(wallet1.address);
    await contract.performUpkeep2(tokenIdOfHolder);

    const boolSubscribed2 = await contract.isSubscribed(tokenIdOfHolder);
    expect(boolSubscribed2).to.be.false;
    
  });

  it("Should set the subscription status to true after resubscribing", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, wallet1] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.deploy();
    await contract.setTokenAddress(USDc.address);

    await contract.connect(wallet1).safeMint()
    await time.increase(60*60*24*36);
    await contract.performUpkeep2(await contract.addressToId(wallet1.address));
    let isSubscribed = await contract.isSubscribed(contract.addressToId(wallet1.address))
    expect(isSubscribed).to.be.false;

    await contract.connect(wallet1).resubscribe();
    isSubscribed = await contract.isSubscribed(await contract.addressToId(wallet1.address));
    expect(isSubscribed).to.be.true;
  });  


  it("Should substract USDC rate when minting", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, wallet1] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.connect(owner).deploy();
    await contract.setTokenAddress(USDc.address);
    await contract.setRate(29);
    await contract.setReferralRate(25);
    
    const transfer = BigNumber.from("100000000000000000000")
    await USDc.connect(owner).transfer(wallet1.address, transfer);
    await USDc.connect(wallet1).approve(contract.address, transfer);
    await contract.connect(wallet1).safeMint();

    expect(await contract.totalSupply()).to.equal(1);

  });  

  it("Should distribute funds correctly when using the mintWithReferral() function", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, wallet1, wallet2] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.connect(owner).deploy();
    await contract.setTokenAddress(USDc.address);
    await contract.setRate(29);
    await contract.setReferralRate(25);

    const transfer = BigNumber.from("100000000000000000000")
    await USDc.connect(owner).transfer(wallet1.address, transfer);
    await USDc.connect(wallet1).approve(contract.address, transfer);
    
    
    await contract.connect(wallet1).mintWithReferral(wallet2.address);
    expect(await contract.totalSupply()).to.equal(1);

    const balance = await contract.connect(wallet2).getBalance();
    expect(balance).to.equal(4);

    await contract.connect(wallet2).userWithdrawReferral();
    const balance2 = await USDc.balanceOf(wallet2.address);
    const expectBalance = BigNumber.from("4000000000000000000");
    expect(balance2).to.equal(expectBalance);

  });  

  it("Should resubscribe when using the resubscribe() function", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, wallet1, wallet2] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.connect(owner).deploy();
    await contract.setTokenAddress(USDc.address);
    await contract.setRate(29);
    await contract.setReferralRate(25);

    const transfer = BigNumber.from("100000000000000000000")
    await USDc.connect(owner).transfer(wallet1.address, transfer);
    await USDc.connect(wallet1).approve(contract.address, transfer);

    
    
    await contract.connect(wallet1).safeMint();
    expect(await contract.totalSupply()).to.equal(1);
    await time.increase(36*24*60*60);


    const tokenIdOfHolder = await contract.addressToId(wallet1.address);

    await contract.connect(owner).performUpkeep2(tokenIdOfHolder);

    const boolSubscribed = await contract.isSubscribed(tokenIdOfHolder);
    expect(boolSubscribed).to.be.false;


    await contract.connect(wallet1).resubscribe();
    const boolSubscribed2 = await contract.isSubscribed(tokenIdOfHolder);
    expect(boolSubscribed2).to.be.true;

    expect(ethers.utils.formatEther(await USDc.balanceOf(wallet1.address))).to.equal("42.0")


  });  

  it("Should resubscribe with Referral when using the resubscribeWithReferral() function", async function(){
    const testContract = await hre.ethers.getContractFactory("PolarSubscriptionV4");
    const contract  = await testContract.deploy();
    const [owner, wallet1, wallet2] = await ethers.getSigners();

    const tUsdc = await hre.ethers.getContractFactory("USDC");
    const USDc = await tUsdc.connect(owner).deploy();
    await contract.setTokenAddress(USDc.address);
    await contract.setRate(29);
    await contract.setReferralRate(25);

    const transfer = BigNumber.from("100000000000000000000")
    await USDc.connect(owner).transfer(wallet1.address, transfer);
    await USDc.connect(wallet1).approve(contract.address, transfer);

    
    
    await contract.connect(wallet1).mintWithReferral(wallet2.address);
    expect(await contract.totalSupply()).to.equal(1);
    await time.increase(36*24*60*60);


    const tokenIdOfHolder = await contract.addressToId(wallet1.address);

    await contract.connect(owner).performUpkeep2(tokenIdOfHolder);
    const boolSubscribed = await contract.isSubscribed(tokenIdOfHolder);
    expect(boolSubscribed).to.be.false;
    expect(await contract.tokenURI(tokenIdOfHolder)).to.equal("https://api.npoint.io/1c50dcf81e6c2350f361");



    await contract.connect(wallet1).resubscribeWithReferral(wallet2.address);
    const boolSubscribed2 = await contract.isSubscribed(tokenIdOfHolder);
    expect(boolSubscribed2).to.be.true;
    expect(await contract.tokenURI(tokenIdOfHolder)).to.equal("https://api.npoint.io/d77b7224349124758fb2");

    const balance = await contract.connect(wallet2).getBalance();
    expect(balance).to.equal(8);

  });  
});