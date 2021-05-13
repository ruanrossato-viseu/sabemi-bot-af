const process = require("process");
const axios = require("axios");
require("dotenv").config();


module.exports.getAddressByCEP = async function getAddressByCEP(cep){
    var config = {
        method: 'get',
        url: `http://viacep.com.br/ws/${cep}/json/`,
        headers: { }
    };
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