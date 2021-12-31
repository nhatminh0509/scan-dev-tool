import React, { useState, useEffect, useContext } from 'react';
import { Button, Checkbox, Input } from 'antd';
import './style.scss'
import AppContext from '../../Context/AppContext';
import Web3 from 'web3'
import icLoadingDark from '../../static/images/icon/loading-dark.gif'
import icLoading from '../../static/images/icon/loading.gif'

const TYPE_MULTI = {
  NONE: 'none',
  FOR: 'for',
  ARRAY: 'array'
}

const Automatic = () => {
  const [app] = useContext(AppContext)
  const { isDarkMode } = app

  const [abiJson, setAbiJson] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [rpc, setRPC] = useState('')
  const [abi, setAbi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [inputs, setInputs] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(null), 3000)
    }
  }, [error])

  const handleChangeAbi = (e) => {
    const newAbi = e.target.value.toString()
    setAbiJson(newAbi)
    if (newAbi === '') {
      setAbi(null)
    }
    if (newAbi.startsWith(`{`) && newAbi.endsWith(`}`) && newAbi.includes(`"name"`) && newAbi.includes(`"inputs"`) && newAbi.includes(`"outputs"`) && newAbi.includes(`"function"`)) {
      handleDetectABI(newAbi)
    }
  }

  const handleDetectABI = (abi) => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
    const abiObj = JSON.parse(abi)
    setAbi(abiObj)
  }

  const run = async () => {
    const cloneObjInputs = { ...inputs }
    let objMulti = {}
    let objNotMulti = {}
    let arrMultil = abi.inputs.map((item) => {
      if (cloneObjInputs[item.name].isMulti) {
        objMulti[item.name] = cloneObjInputs[item.name]
        return { ...cloneObjInputs[item.name], name: item.name}
      }
      return null
    })
    arrMultil = arrMultil.filter(item => item !== null)

    let arrNotMultil = abi.inputs.map((item) => {
      if (!cloneObjInputs[item.name].isMulti) {
        objNotMulti[item.name] = cloneObjInputs[item.name]
        return { ...cloneObjInputs[item.name], name: item.name}
      }
      return null
    })
    arrNotMultil = arrNotMultil.filter(item => item !== null)

    let typeMulti = TYPE_MULTI.NONE
    let errorMulti = null
    if (arrMultil.length > 0) {
      if (arrMultil[0].value.includes('=>')) {
        typeMulti = TYPE_MULTI.FOR
        if (arrMultil.length > 1) {
          errorMulti = 'Error: Multiple type.'
        }
      } else {
        typeMulti = TYPE_MULTI.ARRAY
        arrMultil.map((item) => {
          if (!item?.value?.startsWith('[') || !item.value.endsWith(']')) {
            errorMulti = 'Error: Multiple type.'
          }
        })
      }
    }

    if (errorMulti) {
      setError(errorMulti)
      return
    }

    console.log(typeMulti)
    console.log(arrMultil)

    if (typeMulti === TYPE_MULTI.FOR) {
      const [from, to] = arrMultil[0].value.split('=>')
      for (let i = Number(from); i < Number(to); i++) {
        const params = abi.inputs.map((item) => {
          if (objNotMulti[item.name]){
            if (item.type.includes('int') && item.type.includes('[]')) {
              const arr = JSON.parse(objNotMulti[item.name].value)
              return arr.map(item => Number(item))
            } else if (item.type.includes('int')) {
              return Number(objNotMulti[item.name].value)
            } else {
              return objNotMulti[item.name].value
            }
          } else {
            return i
          }
        })
        await runTransaction(inputs.userAddress.value, inputs.privateKey.value, params)
      }
    }
  }
  // useEffect(() => {
  //   runTransaction()
  // }, [])
  const runTransaction = async (address, privateKey, params) => {
    try{
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const contract = new web3.eth.Contract([abi], contractAddress)
    const dataTx = contract.methods.convert(...params).encodeABI()
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(address);

    const rawTransaction = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(gasPrice * 1.1),
      from: address,
      to: contractAddress,
      data: dataTx,
    };
    const gasLimit = await web3.eth.estimateGas(rawTransaction);

    const gasLimitHex = web3.utils.toHex(gasLimit);
    rawTransaction.gasLimit = gasLimitHex;
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, privateKey);
    return web3.eth
      .sendSignedTransaction(signedTransaction.rawTransaction)
      .on('receipt', ({ transactionHash }) => {
        console.log(`${abi.name} hash: ${transactionHash}`)
      })
      .catch((error) => {
        console.log('error', error);
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  const renderStep1 = () => {
    return (
      <>
       <div className='input-wrapper MT10'>
          <p className='title'>RPC: </p>
          <Input disabled={loading} className='input MT5' placeholder='' value={rpc} onChange={(e) => setRPC(e.target.value)} />
        </div>
       <div className='input-wrapper MT10'>
          <p className='title'>Contract Address: </p>
          <Input disabled={loading} className='input MT5' placeholder='0x...' value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} />
        </div>
       <div className='input-wrapper MT10'>
          <p className='title'>Min ABI: </p>
          <Input disabled={loading} className='input MT5' placeholder='{ "name": ... }' value={abiJson} onChange={handleChangeAbi} />
        </div>
        {loading && <img width={isDarkMode ? 40 : 70} alt='loading' className='MT15 loading' src={isDarkMode ? icLoadingDark : icLoading} />}
        {
          !loading && abi && <>
            <p className='info MT20'>Function name: {abi?.name}</p>
            <Button onClick={() => setStep(2)} className='btn MT20'>Next Step</Button>
          </>
        }
      </>
    )
  }

  const onChangeInputs = (name, value) => {
    const newInput = { ...inputs }
    newInput[name] = newInput[name] ? { ...newInput[name], ...value } : { isMulti: false, value: '', ...value }
    setInputs(newInput)
  }

  const renderStep2 = () => {
    return (
      <>
        <div className='input-wrapper MT15'>
          <div className='title-wrapper'>
            <p className='title'>User address: </p>
          </div>
          <Input value={inputs?.userAddress ? inputs.userAddress.value : ''} onChange={(e) => onChangeInputs('userAddress', { value: e.target.value })} className='input MT5'/>
        </div>
        <div className='input-wrapper MT15'>
          <div className='title-wrapper'>
            <p className='title'>Private key: </p>
          </div>
          <Input value={inputs?.privateKey ? inputs.privateKey.value : ''} onChange={(e) => onChangeInputs('privateKey', { value: e.target.value })} className='input MT5'/>
        </div>
        {
          abi.inputs.map((item) => {
            return (
              <div className='input-wrapper MT15' key={item.name}>
                <div className='title-wrapper'>
                  <p className='title'>{item.name}: </p> <Checkbox checked={inputs[item.name] ? inputs[item.name].isMulti : false} onChange={(e) => onChangeInputs(item.name, { isMulti: e.target.checked })} /> <span className='multi'>Multilple</span>
                </div>
                <Input value={inputs[item.name] ? inputs[item.name].value : ''} onChange={(e) => onChangeInputs(item.name, { value: e.target.value })} className='input MT5'/>
              </div>
            )
          })
        }
        <div className='btn-wrapper MT20'>
          <Button disabled={loading} onClick={() => setStep(1)} className='btn'>Prev Step</Button>
          <Button loading={loading} disabled={abi && abi?.inputs?.length + 2 !== Object.keys(inputs).length} onClick={run} className='btn ML15'>Run</Button>
        </div>
      </>
    )
  }

  return (
    <div className='automatic-container'>
      <h2 className='title'>Automatic</h2>
      {step === 1 && renderStep1()}
      {step === 2 && abi && renderStep2()}
      {error && <h3 className='text-error'>{error}</h3>}
    </div>
  );
};

export default Automatic;
