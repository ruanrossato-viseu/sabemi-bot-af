const process = require("process");
const axios = require("axios");
const { parse } = require("dotenv");
const moment = require("moment");
require("dotenv").config();


module.exports.validateUser = async function validateUser(CodigoPessoaFisica, PrimeirosDigitos, Nome){


    var data = JSON.stringify({
        "CodigoPessoaFisica": CodigoPessoaFisica,
        "PrimeirosDigitos": String(PrimeirosDigitos),
        "Nome": Nome
    });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/ApiIntegracaoSol/v1/usuario/validar',
            headers: { 
                    'Content-Type': 'application/json'
            },
            data : data
    };

    var success = false;
    var requestCounter = 0;
    let addressInfo = false;

    while(!success && requestCounter < 3){
        addressInfo = await axios(config)
        .then((response) => {
            console.log(response.data)
            if(response.data.sucesso){
                success = true;
                return response.data;
            }            
        })
        .catch((error) => {
            console.log(error)
            return {sucesso:false};
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        requestCounter+=1
    }

    return addressInfo
}




module.exports.optIn = async function optIn(CodigoPessoaFisica,choice, phoneNumber){


    var data = JSON.stringify({
        "CodigoPessoaFisica": CodigoPessoaFisica,
        "Optin": choice,
        "Telefone":phoneNumber
    });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/ApiIntegracaoSol/v1/optin',
            headers: { 
                    'Content-Type': 'application/json'
            },
            data : data
    };
    let addressInfo = await axios(config)
        .then((response) => {
            console.log(response.data)
            return response.data;
        })
        .catch((error) => {
            console.log(error)
            return (false);
        });
        return addressInfo

}

module.exports.firstSimulation = async function firstSimulation(CodigoPessoaFisica, phoneNumber){


    var data = JSON.stringify({
        "CodigoPessoaFisica": CodigoPessoaFisica,
        "Telefone":phoneNumber
    });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/ApiIntegracaoSol/v1/simulacao/inicial',
            headers: { 
                    'Content-Type': 'application/json'
            },
            data : data
    };

    let addressInfo = await axios(config)
        .then((response) => {
            console.log(response.data)
            return response.data;
        })
        .catch((error) => {
            console.log(error)
            return false;
        });
        return addressInfo
}

module.exports.newSimulation = async function newSimulation(CodigoPessoaFisica,valor, phoneNumber){


    var data = JSON.stringify({
        "CodigoPessoaFisica": CodigoPessoaFisica,
        "Valor":valor,
        "Telefone":phoneNumber
    });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/ApiIntegracaoSol/v1/simulacao/',
            headers: { 
                    'Content-Type': 'application/json'
            },
            data : data
    };

    let addressInfo = await axios(config)
        .then((response) => {
            console.log(response.data)
            return response.data;
        })
        .catch((error) => {
            console.log(error)
            return false;
        });
        return addressInfo
}


module.exports.closeContract = async function closeContract(CodigoPessoaFisica,tabela,simulationKey, phoneNumber){


    var data = JSON.stringify({
        "CodigoPessoaFisica": parseInt(CodigoPessoaFisica),
        "TabelaSelecionada": parseInt(tabela.codigoTabela),
        "ChaveSimulacao": simulationKey,
        "Prazo": parseInt(tabela.prazo.replace(".","").replace(",",".")),
        "ValorVenda": parseFloat(tabela.valorVenda.replace(".","").replace(",",".")),
        "ValorLiquido": parseFloat(tabela.valorLiquido.replace(".","").replace(",",".")),
        "ValorParcela": parseFloat(tabela.valorParcela.replace(".","").replace(",",".")),
        "ValorPlano": parseFloat(tabela.valorAP.replace(".","").replace(",",".")),
        "ValorTaxa": parseFloat(tabela.taxa.replace(".","").replace(",",".")),
        "DataSimulacao": String(moment().toISOString()),
        "Telefone":phoneNumber
      });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/ApiIntegracaoSol/v1/finalizacao/',
            headers: { 
                    'Content-Type': 'application/json'
            },
            data : data
    };
    resposta=null
    let addressInfo = await axios(config)
        .then((response) => {
            resposta  = response.data
            console.log(response.data)
            return response.data;
        })
        .catch((error) => {
            console.log(error)
            console.log(resposta)
            return (false);
        });
        return addressInfo
}
