import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import CourseRegistration from './contracts/CourseRegistration.json';
import './App.css';

function App() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [courseFee, setCourseFee] = useState(0);
    const [email, setEmail] = useState('');
    const [payments, setPayments] = useState([]);
    const [isOwner, setIsOwner] = useState(false); 

    useEffect(() => {
      async function loadWeb3() {
          if (window.ethereum) {
              const web3Instance = new Web3(window.ethereum);
              setWeb3(web3Instance);
  
              const accounts = await web3Instance.eth.requestAccounts();
              console.log(accounts);
              setAccount(accounts[0]);
  
              const networkId = await web3Instance.eth.net.getId();
              const deployedNetwork = CourseRegistration.networks[networkId];
              const contractInstance = new web3Instance.eth.Contract(
                  CourseRegistration.abi,
                  deployedNetwork && deployedNetwork.address,
              );
              setContract(contractInstance);
  
              const fee = await contractInstance.methods.courseFee().call();
              setCourseFee(web3Instance.utils.fromWei(fee, 'ether'));
  
              const allPayments = await contractInstance.methods.getAllPayments().call();
              setPayments(allPayments);
  
              // Debugging owner check
              const owner = await contractInstance.methods.owner().call();
              const normalizedAccount = accounts[0].toLowerCase();
              const normalizedOwner = owner.toLowerCase();
              console.log('Account from MetaMask:', accounts[0]);
              console.log('Normalized Account:', accounts[0].toLowerCase());
              console.log('Contract Owner from Blockchain:', owner);
              console.log('Normalized Owner:', owner.toLowerCase());


              setIsOwner(normalizedAccount === normalizedOwner);

          } else {
              alert('Please install MetaMask to use this app.');
          }
      }
  
      loadWeb3();
  }, []);
  

    const handlePayment = async () => {
        if (!email) {
            alert('Please enter your email');
            return;
        }

        try {
            await contract.methods.payForCourse(email).send({ from: account, value: web3.utils.toWei(courseFee, 'ether') });
            alert('Payment successful');
            const allPayments = await contract.methods.getAllPayments().call();
            setPayments(allPayments);
        } catch (error) {
            console.error(error);
            alert('Payment failed');
        }
    };

    const handleWithdraw = async () => {
        try {
            await contract.methods.withdrawFunds().send({ from: account });
            alert('Funds withdrawn successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to withdraw funds');
        }
    };

    return (
        <div className="App">
            <h1>Payment Gateway</h1>
            <p> Fee: {courseFee} ETH</p>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handlePayment}>Pay</button>

            {isOwner && (
                <>
                    <h2>Admin Actions</h2>
                    <button onClick={handleWithdraw}>Withdraw Funds</button>
                </>
            )}

            <h2>Payments</h2>
            <ul>
                {payments.map((payment, index) => (
                    <li key={index}>
                        {payment.email} paid {web3.utils.fromWei(payment.amount, 'ether')} ETH
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
