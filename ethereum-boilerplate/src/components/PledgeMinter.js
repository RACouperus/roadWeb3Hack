import { useState } from 'react';
import { Button, Form, Input, Alert } from "antd";
import { useMoralis } from "react-moralis";
import Web3 from 'web3';
import { contractABI, contractAddress } from "./pledgeContract";
const web3 = new Web3(Web3.givenProvider);

export default function PledgeMinter() {
  
  const { Moralis } = useMoralis();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clause1, setClause1] = useState("");
  const [clause2, setClause2] = useState("");
  const [clause3, setClause3] = useState("");
  const [file, setFile] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      // save image to IPFS
      const file1 = new Moralis.File(file.name, file);
      await file1.saveIPFS();
      const file1url = file1.ipfs();

      // generate metadate and save to IPFS
      const metadata = {
        name, description, clause1, clause2, clause3, file1url
      }
      const file2 = new Moralis.File(`${name}metadata.json`, {
        base64: Buffer.from(JSON.stringify(metadata)).toString('base64')
      })
      await file2.saveIPFS();
      const metadataurl = file2.ipfs();
      // interact with smart contract
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const response = await contract.methods
        .mint(metadataurl)
        // .send( { from: user.get("ethAddress") });
      const tokenId = response.events.Transfer.returnValues.tokenId;
      Alert(
        `Pledge Deed successfully created. Deed address - ${contractAddress} and Deed ID - ${tokenId}`
      );
    } catch (err) {
      console.error(err);
      Alert('something went wrong!')
    }
  };

  return (
    <div>
        <Form onSubmit={onSubmit}>
        <div>
          <Input 
          type="text" 
          placeholder="Name Deed" 
          value={name}
          onChange={e => setName(e.target.value)}
          />
        </div>
        <br/>
        <div>
          <Input 
          type="text" 
          placeholder="Description" 
          value={description}
          onChange={e => setDescription(e.target.value)}
          />
        </div>
        <br/>
        <div>
          <Input 
          type="text"
          placeholder="Clause 1" 
          value={clause1}
          onChange={e => setClause1(e.target.value)}
          />
        </div>
        <br/>
        <div>
          <Input 
          type="text" 
          placeholder="Clause 2" 
          value={clause2}
          onChange={e => setClause2(e.target.value)}
          />
        </div>
        <br/>
        <div>
          <Input 
          type="text" 
          placeholder="Clause 3" 
          value={clause3}
          onChange={e => setClause3(e.target.value)}
          />
        </div>
        <br/>
        <div>
          <Input 
          type="file" 
          placeholder="Description" 
          onChange={e => setFile(e.target.files[0])}
          />
        </div>
        <br/>
        <Button onClick={onSubmit} type="primary" style={{ marginBotton: "20px" }}> 
          Mint Pledge Deed
        </Button>
        </Form>
    </div>
  )
}

