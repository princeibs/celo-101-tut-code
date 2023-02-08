import React, { useState, useEffect } from 'react'
import {
  ChakraProvider,
  Button,
  Flex,
  Input,
  Text
} from "@chakra-ui/react";
import { useCelo } from '@celo/react-celo';
import ABI from "./contracts/ens-abi.json"
import BigNumber from 'bignumber.js';

const contractAddress = "0x00"

const App = () => {
  const [newDomain, setNewDomain] = useState()
  const [contract, setContract] = useState()
  const [searchVal, setSearchVal] = useState()
  const [searchRes, setSearchRes] = useState()
  const [domains, setDomains] = useState()
  const [tx, setTx] = useState()

  const { connect, address, performActions, getConnectedKit } = useCelo()

  const connectWallet = async () => {
    await connect()
    window.location.reload()
  }

  const connection = async () => {
    const kit = await getConnectedKit()
    const contract = new kit.connection.web3.eth.Contract(ABI, contractAddress)
    setContract(contract)
  }

  const createDomain = async () => {
    const [name, tld] = newDomain.split(".")
    const cost = name.length === 2 ? '.1' : name.length === 3 ? '0.05' : name.length === 4 ? '0.03' : '0.01'
    await performActions(async (kit) => {
      const { defaultAccount } = kit.connection;
      try {
        const _cost = new BigNumber(cost).shiftedBy(18).toString()
        const tx = await contract.methods.setName(name, tld).send({ from: defaultAccount, value: _cost })
        setTx(tx)
        alert("Create domain successfully")
      } catch (e) {
        console.log(e)
      }
    })
  }

  const searchDomain = async () => {
    const tld = searchVal[1]
    const name = searchVal[0]
    try {
      const address = await contract.methods.getAddress(tld, name).call()
      setSearchRes(address)
    } catch (e) {
      console.log(e)
    }
  }

  const allCreatedDomains = async () => {
    try {
      const domains = await contract.methods.getAllNames().call()
      setDomains(domains)
    } catch (e) {
      console.log(e)
    }
  }


  useEffect(() => {
    connection()
    allCreatedDomains()
  }, [])

  useEffect(() => {
    allCreatedDomains();
  }, [tx, contract])



  return (
    <ChakraProvider>
      {address ?
        <Flex direction={"column"} align="center" w="100vw" minH="100vh" gap={"20px"}>
          <Text>Connected to {address}</Text>
          <Flex direction={"column"} w="500px" bgColor={"gray.200"} mt="50px" p={"30px"}>
            <Text>Search for domain names</Text>
            <Flex mb="10px" mt={"15px"} gap="10px">
              <Input onChange={e => setSearchVal(e.target.value.split("."))} outline={"1px solid blue"} fontWeight="700"></Input>
              <Button onClick={searchDomain}>Search</Button>
            </Flex>
            <Input outline={"1px solid blue"} disabled fontWeight={"700"} value={searchRes}></Input>
          </Flex>
          <Flex direction={"column"} w="500px" bgColor={"gray.300"} p="25px" borderRadius="3px">
            <Text>Create domain name</Text>
            <Flex mt={"10px"} gap="10px">
              <Input value={newDomain} onChange={e => setNewDomain(e.target.value)} fontFamily="monospace"></Input>
              <Button onClick={createDomain}>Create</Button>
            </Flex>
          </Flex>
          <Flex mt="50px" direction='column'>
            <Text fontWeight={"bold"} textDecor="underline" fontSize={"2xl"}>Domains created so far</Text>
            <Flex direction={"column"}>
              {domains?.map(domain =>
                <Text fontFamily={"monospace"} fontSize="15px">{domain}</Text>
              )}
            </Flex>
          </Flex>
        </Flex> :
        <Flex w={"100vw"} h={"100vh"} align="center" justify={"center"}>Please{" "}<Button onClick={connectWallet}>Connect</Button> "Celo Extension Wallet" to use this dapp</Flex>
      }

    </ChakraProvider>

  )
}

export default App