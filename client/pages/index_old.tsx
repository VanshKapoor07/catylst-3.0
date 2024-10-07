// index.tsx
import React from 'react'; 
import EnterAmount from '../src/EnterAmount';

const Home: React.FC = () => {
  return (
    <div>
        <h1><b>CATALYST 2.O</b></h1> 
    
    <div>
        <div>
            <h2><b>COMPANY</b></h2>
            <form method="post" action="/company">
                <button type="submit" >COMPANYYYYY</button>
            </form>
        </div>
        <div>
            <h2><b>INVESTOR</b></h2>
            <form method="post" action="/investor">
                <button type="submit">INVESTOR</button>
            </form>
        </div>
    </div>
    <div>
        <h2><b>Key Features:</b></h2>
        <ul>
          <li>
          Utilizes blockchain technology for transparent and secure transactions.
            <div>Ensures trust and immutability of transaction records.</div>
          </li>
          <li>
            Smart contract integration for automated execution of funding agreements.
            <div>Automates contract execution, reducing manual intervention.</div>
          </li>
          <li>
            Decentralized platform for democratized access to investment opportunities.
            <div>Provides equal opportunities for all investors, regardless of location or status.</div>
          </li>
        </ul>
    </div>
    <EnterAmount /> {/* Include the EnterAmount component here */}
    </div>
  );
};

export default Home;

