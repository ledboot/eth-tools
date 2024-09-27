const { ethers } = require("ethers");
const fs = require("fs");
const dotenv = require('dotenv');
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);

// receiver address
const toAddress = process.env.TO_ADDRESS;

// ERC20 token contract abi
const erc20Abi = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function decimals() view returns (uint8)",
];

// ERC721 token contract abi
const erc721Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
];

async function transferETH(wallet) {
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log(
      `address ${wallet.address} eth balance:`,
      ethers.formatEther(balance)
    );
    const gasLimit = 21000;

    const feeData = await provider.getFeeData();
    const changeGasPrice = feeData.gasPrice * BigInt(120) / BigInt(100);
    const gasCost = changeGasPrice * BigInt(gasLimit);
    
    console.log(`address ${wallet.address} eth fee price:`, gasCost);
    let amountToSend = balance - gasCost;
    console.log(
      `address ${wallet.address} eth max available balance:`,
      ethers.formatEther(amountToSend)
    );

    if (amountToSend <= 0n) {
      console.log(`address ${wallet.address} eth balance not enough for gas fee`);
      return;
    }
    // use EIP-1559 transaction type to optimize gas fee
    const transferRequest = {
      to: toAddress,
      value: amountToSend,
      gasLimit: gasLimit,
      gasPrice: changeGasPrice,
      // type: 2,
      // maxFeePerGas: feeData.maxFeePerGas,
      // maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    };

    const tx = await wallet.sendTransaction(transferRequest);

    console.log(`address ${wallet.address} eth transfer tx hash:`, tx.hash);
    await tx.wait();
    console.log(
      `address ${wallet.address} eth transfer success, transfer amount: ${ethers.formatEther(amountToSend)} ETH`
    );
  } catch (error) {
    console.error(`address ${wallet.address} eth transfer error:`, error);
  }
}

async function transferERC20(wallet, tokenAddress) {
  try {
    const contract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
    const balance = await contract.balanceOf(wallet.address);
    const decimals = await contract.decimals();

    if (balance === 0n) {
      console.log(`address ${wallet.address} erc20 token balance is 0`);
      return;
    }

    const tx = await contract.transfer(toAddress, balance);
    console.log(`address ${wallet.address} erc20 token transfer tx hash:`, tx.hash);
    await tx.wait();
    console.log(`address ${wallet.address} erc20 token transfer success`);
  } catch (error) {
    console.error(`address ${wallet.address} erc20 token transfer error:`, error);
  }
}

async function isERC20(contract) {
  try {
    await contract.totalSupply();
    return true;
  } catch (error) {
    return false;
  }
}

// not pass verification
async function isERC721(contract) {
  try {
    await contract.balanceOf(wallet.address);
    await contract.ownerOf(1);
    return true;
  } catch (error) {
    return false;
  }
}
async function determineTokenType(tokenAddress) {
  const contract = new ethers.Contract(
    tokenAddress,
    [...erc20Abi, ...erc721Abi],
    provider
  );

  if (await isERC20(contract)) {
    console.log(`address ${tokenAddress} is erc20 token`);
    return "ERC20";
  } else if (await isERC721(contract)) {
    console.log(`address ${tokenAddress} is erc721 token`);
    return "ERC721";
  } else {
    console.log(`address ${tokenAddress} is not erc20 or erc721 token`);
    return "Unknown";
  }
}

async function processWallet(privateKey) {
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`process address: ${wallet.address}`);

  await transferETH(wallet);

  // const tokenType = await determineTokenType('0xyour token contract address');
  // if need transfer erc20 token, please remove the comment and provide token address
  // await transferERC20(wallet, '0xyour erc20 token contract address');
}

async function main() {
  try {
    const privateKeys = fs
      .readFileSync("pk.txt", "utf8")
      .split("\n")
      .filter((key) => key.trim() !== "");

    for (const privateKey of privateKeys) {
      await processWallet(privateKey.trim());
    }
  } catch (error) {
    console.error("process private key file error:", error);
  }
}

main();
