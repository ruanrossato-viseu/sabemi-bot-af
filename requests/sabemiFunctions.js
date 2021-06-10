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
            url: 'https://api.sabemi.com.br/dsv/ApiIntegracaoSol/v1/usuario/validar',
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

module.exports.optIn = async function optIn(CodigoPessoaFisica){


    var data = JSON.stringify({
        "CodigoPessoaFisica": CodigoPessoaFisica,
        "Optin": true
    });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/dsv/ApiIntegracaoSol/v1/optin',
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

module.exports.firstSimulation = async function firstSimulation(CodigoPessoaFisica){


    var data = JSON.stringify({
        "CodigoPessoaFisica": CodigoPessoaFisica
    });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/dsv/ApiIntegracaoSol/v1/simulacao/inicial',
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

module.exports.newSimulation = async function newSimulation(CodigoPessoaFisica,valor){


    var data = JSON.stringify({
        "CodigoPessoaFisica": CodigoPessoaFisica,
        "Valor":valor
    });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/dsv/ApiIntegracaoSol/v1/simulacao/',
            headers: { 
                    'Content-Type': 'application/json'
            },
            data : data
    };

    let addressInfo = await axios(config)
        .then((response) => {
            return response.data;
            console.log(response.data)
        })
        .catch((error) => {
            console.log(error)
            return false;
        });

    return addressInfo
}


module.exports.closeContract = async function closeContract(CodigoPessoaFisica,tabela,simulationKey){


    var data = JSON.stringify({
        "CodigoPessoaFisica": parseInt(CodigoPessoaFisica),
        "TabelaSelecionada": parseInt(tabela.CodigoTabela),
        "ChaveSimulacao": simulationKey,
        "Prazo": parseInt(tabela.Prazo),
        "ValorVenda": parseInt(tabela.ValorVenda),
        "ValorLiquido": parseInt(tabela.ValorLiquido),
        "ValorParcela": parseInt(tabela.ValorParcela),
        "ValorPlano": parseInt(tabela.ValorAP),
        "ValorTaxa": parseInt(tabela.Taxa),
        "DataSimulacao": String(moment().toISOString())
      });

    var config = {
            method: 'post',
            url: 'https://api.sabemi.com.br/dsv/ApiIntegracaoSol/v1/finalizacao/',
            headers: { 
                    'Content-Type': 'application/json'
            },
            data : data
    };

    let addressInfo = await axios(config)
        .then((response) => {
            return response.data;
            console.log(response.data)
        })
        .catch((error) => {
            console.log(error)
            return (false);
        });

    return addressInfo
}
