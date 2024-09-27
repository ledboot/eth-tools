const {ethers} = require('ethers');

let privateKey = "";
let wallet = new ethers.Wallet(privateKey);
let signPromise = wallet.signMessage("Hello World!")
signPromise.then((signature)=>{
    console.log(signature)
})