const process = require("process");
const axios = require("axios");
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
    return {
                "sucesso": true,
                "mensagem": "OK"
            }
    let addressInfo = await axios(config)
        .then((response) => {
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
    return {
                "sucesso": true,
                "mensagem": "OK"
            }
    let addressInfo = await axios(config)
        .then((response) => {
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
    return {
            "tabelas": [
                {
                    "codigoTabela": 22010,
                    "prazo": "72",
                    "valorVenda": "39.969,71",
                    "valorLiquido": "39.969,71",
                    "valorParcela": "950,00",
                    "taxa": "1,53",
                    "valorPeculio": "0,00",
                    "valorAP": "0,00"
                },
                {
                    "codigoTabela": 22017,
                    "prazo": "72",
                    "valorVenda": "39.781,76",
                    "valorLiquido": "39.781,76",
                    "valorParcela": "926,00",
                    "taxa": "1,46",
                    "valorPeculio": "0,00",
                    "valorAP": "24,00"
                }
            ],
            "chaveSimulacao": "51894351134",
            "sucesso": true,
            "mensagem": "OK"
        }
    let addressInfo = await axios(config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error)
            return (false);
        });

    return addressInfo
}