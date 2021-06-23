module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("pararMenu", controller);
    const utils = require('../requests/utils.js');
    const sabemiFunctions = require('../requests/sabemiFunctions.js');

    flow.addAction("menu");

    flow.before("menu",async(flow,bot)=>{
        console.log(flow.vars.user)


        const{MongoClient} = require('mongodb');
        var url = process.env.MONGO_URI
        
        const client = new MongoClient(url,{ useUnifiedTopology: true });
        try{
            await client.connect();
            var  database =  client.db("sabemi")
            var collection = database.collection("users")
            var user  = await collection.findOne({"phoneNumber": flow.vars.user })
            console.log(user)

            flow.setVar("userDB",user)
        }
        catch (err){
            console.log(err)
        }
        finally {
            await client.close();
        }
    })
    

    flow.addQuestion("[PARAR]+++Certo! Tudo bem! Me conta o que você prefere fazer agora:\
        \n\nDigite 1 para \"mudei meus planos\"\
        \nDigite 2 para \"quero falar com um especialista\" \
        \nDigite 3 para \"já contratei um Empréstimo Pessoal\"\
        \nDigite 4 para \"não quero mais ter contato com a Sabemi\"",
        async(response, flow, bot)=>{
            if(response == "1"){
                await flow.gotoThread("changeOfPlans")
            }
            else if(response == "2"){
                await flow.gotoThread("transferToHuman")                
            }
            else if(response == "3"){                
                flow.setVar("beforeEvaluation","Obrigada por compartilhar isso comigo!")
                await flow.gotoThread("evaluation")
            }
            else if(response == "4"){
                await bot.say("[BLACKLIST]+++Obrigada por me avisar!\nSe desejar falar com a Sabemi, é só me chamar! Basta digitar SOL que estarei pronta para te atender :)")  
                await sabemiFunctions.optIn(flow.vars.userDB.codigo, false); 
                flow.setVar("beforeEvaluation","")
                await flow.gotoThread("evaluation")             
            }
            else{
                await flow.gotoThread("menuRetry")               
            }

        },
        "menuChoice",
        "menu"
    )

    flow.addQuestion("[PARAR]+++Puxa 😕 Essa opção não é válida.\
                        \nVamos tentar novamente?",
                    async(response, flow, bot)=>{
                        if(response == "1"){
                            await flow.gotoThread("changeOfPlans")
                        }
                        else if(response == "2"){
                            await flow.gotoThread("transferToHuman")                
                        }
                        else if(response == "3"){                
                            flow.setVar("beforeEvaluation","Obrigada por compartilhar isso comigo!")
                            await flow.gotoThread("evaluation")
                        }
                        else if(response == "4"){
                            await bot.say("[BLACKLIST]+++Obrigada por me avisar!\nSe desejar falar com a Sabemi, é só me chamar! Basta digitar SOL que estarei pronta para te atender :)")  
                            await sabemiFunctions.optIn(user.codigo, false); 
                            flow.setVar("beforeEvaluation","")
                            await flow.gotoThread("evaluation")             
                        }
                        else{
                            await flow.gotoThread("transferToHumanFail")             
                        }

                    },
                    "menuChoice",
                    "menuRetry"
                )

    flow.addQuestion("[PARAR]+++Puxa, o que mudou? 😔\
                    \n Me conta o motivo da sua mudança:\
                    \n\nDigite 1 para \"já contratei um Empréstimo Pessoal\"\
                    \nDigite 2 para \"prefiro utilizar outra forma de crédito (exemplo: cartão de crédito)\"\
                    \nDigite 3 para \"não faz mais sentido contratar um Empréstimo Pessoal\"",
                    async(response,flow,bot)=>{
                        if(response!="1" &&response!="2" &&response!="3" ){
                            await flow.gotoThread("changeOfPlansRetry")
                        }
                        flow.setVar("beforeEvaluation","Obrigada por compartilhar isso comigo!")
                        await flow.gotoThread("evaluation")
                    },
                    "changeOfPlanesChoice",
                    "changeOfPlans"
    );

    flow.addQuestion("[PARAR]+++Puxa 😕 Essa opção não é válida.\
                        \nVamos tentar novamente?",
                    async(response,flow,bot)=>{
                        if(response!="1" &&response!="2" &&response!="3" ){
                            await flow.gotoThread("transferToHumanFail") 
                        }
                        flow.setVar("beforeEvaluation","Obrigada por compartilhar isso comigo!")
                        await flow.gotoThread("evaluation")
                    },
                    "changeOfPlanesChoice",
                    "changeOfPlans"
    );

    flow.addQuestion("[PARAR]+++{{vars.beforeEvaluation}}\
                    \n\n Posso te pedir uma ajudinha?\
                    \nVocê poderia avaliar este atendimento?\
                    \nJuro que é rapidinho e vai me ajudar a te atender cada vez melhor 😃\
                    \n\nDigite 1 para: muito satisfeito\
                    \nDigite 2 para: satisfeito\
                    \nDigite 3 para: não me ajudou\
                    \nDigite 4 para: péssimo\
                    \n\nBj e até a próxima!",
                    async(response,flow,bot)=>{
                        if(response!="1" &&response!="2" &&response!="3" &&response!="4" ){
                            flow.gotoThread("evaluationRetry")
                        }
                        else{
                            flow.gotoThread("evaluationEnd")
                        }
                    },
                    "evaluation",
                    "evaluation"
    );

    flow.addQuestion("[PARAR]+++Puxa 😕 Essa opção não é válida.\
                    \nVamos tentar novamente?",
                    async(response,flow,bot)=>{
                        if(response!="1" &&response!="2" &&response!="3" &&response!="4" ){
                            await flow.gotoThread("transferToHumanFail") 
                        }
                        else{
                            flow.gotoThread("evaluationEnd")
                        }
                    },
                    "evaluation",
                    "evaluationRetry"
    );

    flow.addMessage("[PARAR]+++Obrigada! Se precisar falar comigo, é só digitar \"Sol\"\
                    \nBj e até a próxima!",
                    "evaluationEnd"
    );
    
    
    flow.before("transferToHuman", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",`Entendi! É só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗\
                                    \n\nTudo será resolvido por lá, ok!? 👩🏻‍💻`)
                        // flow.setVar("messageTransfer",
                        //             "Entendi! Vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "Puxa! ⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
                                    \n\nRetorne com um alô, no link 👉🏼 https://bit.ly/3gNNcLH , no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                                    \nBjs e até breve")
                    }
                }
            );
    flow.addMessage("{{vars.messageTransfer}}","transferToHuman");

    
    
    flow.before("transferToHumanFail", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",`Entendi! É só clicar no link 👉🏼 https://bit.ly/3gNNcLH e em breve você será atendido com todo cuidado e qualidade possível 🤗\
                                    \n\nTudo será resolvido por lá, ok!? 👩🏻‍💻`)
                        // flow.setVar("messageTransfer",
                        //             "Puxa, a opção digitada é invalida! 😐\
                        //             \n\nMas fique tranquilo, vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "Puxa!⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
                                    \n\nRetorne com um alô, no link 👉🏼 https://bit.ly/3gNNcLH , no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                                    \nBjs e até breve")
                    }
                }
            );
    flow.addMessage("[transferToHuman]+++{{vars.messageTransfer}}","transferToHumanFail");

    flow.after(async (results, bot) => {
        await bot.cancelAllDialogs();
    });
    controller.addDialog(flow);
};