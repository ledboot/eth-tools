const {ethers} = require('ethers');
const fs = require('fs');

// 创建一个钱包实例
const wallet = ethers.Wallet.createRandom();

// 获取地址和私钥
const address = wallet.address;
const privateKey = wallet.privateKey;

// 创建或写入account.txt文件，使用逗号分隔地址和私钥
fs.appendFile('account.txt', `${address},${privateKey}\n`, (err) => {
  if (err) {
    console.error('write account.txt error:', err);
  } else {
    console.log('account generated and saved to account.txt');
  }
});