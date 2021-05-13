module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("cadastramento", controller);

    
    const cadastramentoFunctions = require('../requests/cadastramento.js');

    flow.addAction("mainFlow")

    
    flow.addQuestion("Para concluir seu contrato, preciso de algumas informações suas.\
                    \nQuer continuar esse processo aqui pelo *WhatsApp* ou prefere usar o *App Sabemi*?\
                    \n[1] WhatsApp\
                    \n[2] App Sabemi", 
                    async(response, flow, bot) =>{

                        if(response.toLowerCase() == "1"){
                        }

                        else if(response.toLowerCase() == "2"){
                            await flow.gotoThread(`cadastramentoApp`)
                        }

                        else{
                            //await bot.say("Não entendi o que falou. Digite SIM para saber mais ou DEPOIS para falar mais tarde")
                            await flow.repeat();
                        }
                        
                    },
                    "appOrBot",
                    "mainFlow");
       
 
    flow.addMessage("Ok, para concluir a proposta de Assistência Financeira, acesse o link http://linkAppResponsivo.com e preencha os seus dados pessoais",
                    "cadastramentoApp")
    

    
    flow.addQuestion("Por favor, escreva seu *nome completo*", 
                    async(response, flow, bot) =>{
                        flow.setVar("firstName",response.split(" ")[0])                       
                    },
                    "fullname",
                    "mainFlow");


    flow.addQuestion("Obrigada, {{vars.firstName}}. E qual é seu *e-mail?*", 
                    async(response, flow, bot) =>{
                    },
                    "email",
                    "mainFlow");


    flow.addAction("address","mainFlow")

    flow.addMessage(`Ok. Muito obrigada! Agora vou precisar de algumas informações do seu endereço para concluir o contrato da Assistência Financeira`,"address")


    flow.addQuestion(`Me passe seu *CEP*`, 
                    async(response, flow, bot) =>{
                        let addressInfo = await cadastramentoFunctions.getAddressByCEP(response)
                        flow.setVar("addressInfo", addressInfo);
                    },
                    "CEP",
                    "address");
                    
                    
    flow.addQuestion(`Seu endereço é: {{vars.addressInfo.logradouro}}, {{vars.addressInfo.bairro}}, {{vars.addressInfo.localidade}} - {{vars.addressInfo.uf}}?\
                    \n Digite *Sim* ou *Não*`, 
                    async(response, flow, bot) =>{
                        if(response.toLowerCase() == "sim"){
                            await flow.gotoThread("addressMissingInfo")
                        }
                        else if(response.toLowerCase() == "não" || response.toLowerCase() == "nao"){
                            await flow.gotoThread("addressNoCEP")
                        }
                        else{
                            console.log(response)
                        }
                    },
                    "confirmAddress",
                    "address");

    flow.addQuestion("Digite o nome do *logradouro* (rua, avenida, etc) da sua residência", 
                    async(response, flow, bot) =>{
                        
                    },
                    "addressStreet",
                    "addressNoCEP")

    flow.addQuestion("Agora digite o nome da *cidade*", 
                    async(response, flow, bot) =>{
                        
                    },
                    "adressCity",
                    "addressNoCEP")

    flow.addQuestion("E o *bairro*, qual é?", 
                    async(response, flow, bot) =>{
                        
                    },
                    "adressCity",
                    "addressNoCEP")

    flow.addQuestion("Certo, e o *estado*?", 
                    async(response, flow, bot) =>{
                        
                    },
                    "adressCity",
                    "addressNoCEP")

    flow.addAction("addressMissingInfo","addressNoCEP")

    flow.addQuestion("Preciso do *número* da sua residência", 
                    async(response, flow, bot) =>{
                        
                    },
                    "addressNumber",
                    "addressMissingInfo")

    flow.addQuestion("Para acabar, qual é o *complemento* do seu endereço? Se não tiver complemento, pode digitir \"Nenhum\"", 
                    async(response, flow, bot) =>{
                        
                    },
                    "addressComplement",
                    "addressMissingInfo")

    flow.addAction("personalInfo","addressMissingInfo");


    flow.addQuestion("Obrigada. Agora preciso saber seu *estado civil*.\
                    \n _Digite o número do lado_\
                    \n[1] Solteiro(a)\
                    \n[2] Casado(a)\
                    \n[3] Divorciado(a)\
                    \n[4] Viúvo(a)", 
                    async(response, flow, bot) =>{
                        if(response=="1" || response=="2" || response=="3" || response=="4" || response=="5"){

                        }
                        else{
                            await bot.say("Por favor, digite de 1 a 5, de acordo com seu estado civil. Vamos tentar de novo");
                            await bot.repeat()
                        }
                    },
                    "relationshipStatus",
                    "personalInfo")
                    
    flow.addQuestion("E qual é o *nome da sua mãe*?", 
            async(response, flow, bot) =>{
                
            },
            "mothersName",
            "personalInfo")

    flow.addAction("bankingInfo","personalInfo");

    flow.addQuestion("Estamos quase no fim. Agora preciso de informações bancárias.\
                    \nQual é o *código do seu banco*?\
                    \nSe você não souber, digite *Não Sei*", 
                    async(response, flow, bot) =>{
                        if(response.toLowerCase()=="não sei" || response.toLowerCase()=="nao sei"){
                            await bot.say("Para consultar o código do seu banco, acesse www.consultabanco.com.br e volta aqui para me informar")
                            await bot.repeat()    
                        }
                    },
                    "bankCode",
                    "bankingInfo")

    flow.addQuestion("E a *agência*?",
                    async(response,flow,bot)=>{

                    },
                    "bankAgency",
                    "bankingInfo")

    flow.addQuestion("Para acabar, preciso da *conta corrente*",
                    async(response,flow,bot)=>{

                    },
                    "bankAccount",
                    "bankingInfo")

    flow.addAction("documents","bankingInfo")

    flow.addMessage("Ok, obrigada. Esses são todos os dados de que eu precisava!\
                    \nAgora preciso que tire foto ou envie uma cópia de alguns documentos para mim, aqui pelo Whatsapp mesmo",
                    "documents")
    
    flow.addQuestion("Vamos começar pelo *RG*. Tire uma *foto da parte de trás*, onde tem seu 3x4",
                    async(response,flow,bot)=>{

                    },
                    "rgFront",
                    "documents")

    flow.addQuestion("E agora uma *foto da parte da frente*, com seu nome e número de RG",
                    async(response,flow,bot)=>{

                    },
                    "rgBack",
                    "documents")
                    
    flow.addQuestion("Próximo, eu preciso de uma foto de um *comprovante de residência*",
                    async(response,flow,bot)=>{

                    },
                    "housingCertificate",
                    "documents")

    flow.addQuestion("E para concluir, me envie uma foto do seu último *contra-cheque*",
                    async(response,flow,bot)=>{

                    },
                    "paymentReceipt",
                    "documents")

    flow.addAction("wrap","documents")
    
    flow.addMessage("[DOCUMENTO]","wrap")

    flow.addQuestion("Certo, aqui está seu contrato de Assistência Financeira. Você concorda com os termos da proposta\
                    \nDigite *Concordo* ou *Discordo*",
                    async(response,flow,bot)=>{
                        if(response == "1"){
                            flow.gotoThread("wrapConfirm")
                        }
                        else if(response == "2"){

                        }
                    },
                    "acceptContract",
                    "wrap")


    flow.addMessage("Obrigada! Sua proposta está completa e está sendo agora analisada pelos nossos consultores.\
                    \nAssim que tiver uma atualização, eu lhe chamo por aqui para avisar.",
                    "wrapConfirm")
    
    controller.addDialog(flow);
};