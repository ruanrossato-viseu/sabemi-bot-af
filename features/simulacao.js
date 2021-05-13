module.exports = function(controller) {

    const { BotkitConversation } = require("botkit");
    const flow = new BotkitConversation("simulacao", controller);
    const utils = require('../requests/utils.js');


    flow.addAction("mainFlow")

    flow.addMessage("Olá, João,  eu sou a *Sol*, especialista de Crédito da Sabemi 🙋‍♀️. Tenho uma solução personalizada para você tirar seus planos do papel e realizar seus sonhos",
                    "mainFlow")
    flow.addQuestion("Se quiser saber mais, para segurança dos seus dados, preciso garantir que estou falando com a pessoa certa\
                    \n\n *João da Silva*, é você mesmo?😊\
                    \n\nDigite *Sim*, se for você\
                    \n\nDigite *Não*, se você não conhecer essa pessoa", 
                    async(response, flow, bot) =>{

                        if(response.toLowerCase() == "sim" || response =="1"){
                        }

                        else if(response.toLowerCase() == "não" || response.toLowerCase() == "nao"){
                            await bot.beginDialog("notRightPerson");
                        }

                        else{
                            await bot.say("Não entendi o que falou. Digite *Sim*, se for você ou *Não*, se você não conhecer essa pessoa")
                            await flow.repeat();
                        }
                        
                    },
                    "rightPerson",
                    "mainFlow");
       
    flow.addMessage("Ops! Peço desculpas pelo incômodo. Obrigado por avisar!","notRightPerson")
    flow.addAction("endConversation","notRightPerson")

    flow.addMessage("Que bom! Agora você esta um passo mais próximo de realizar seus sonhos! 🤩\
                \n\nE para que eu possa apresentar uma proposta na medida, vou precisar que você me informe alguns dos seus dados pessoais.\
                \n\nMas vale ressaltar: *este é um ambiente seguro* e seus dados estão protegidos e guardados, tudo de acordo com a *Lei Geral de Proteção de Dados* (LGPD) e *Direito do Consumidor* 🔒",
                "mainFlow")
    
    flow.addMessage("Se quiser saber mais, é só clicar nesse link para acessar nossas políticas e termos sobre a Lei Geral de Proteção de dados: 👉🏼 https://www.sabemi.com.br/politica-de-privacidade",
                    "mainFlow")
    

    
    flow.addQuestion("Vamos lá!? Me conta qual é o seu *nome completo*?", 
                    async(response, flow, bot) =>{
                        flow.setVar("firstName",response.split(" ")[0])
                        
                    },
                    "name",
                    "mainFlow");

    
    flow.addQuestion(`Legal! Digita aqui pra mim os *3 primeiros dígitos do seu CPF*`,

                    async(response, flow, bot) =>{
                        /*let cpf = response.replace(/\D/g,'');
                        
                        if(cpf.length == 11){
                            let j = (cpf[0]*10 + cpf[1]*9 + cpf[2]*8 + cpf[3]*7 + cpf[4]*6 + cpf[5]*5 + cpf[6]*4 + cpf[7]*3 + cpf[8]*2) % 11;
                            if(j<=1){j = 0}
                            else{j=11-j}
                            if(j != cpf[9]){
                                await bot.say(`Esse CPF não é válido`);
                                await flow.repeat();
                            }
                            else{
                                let k = (cpf[0]*11 + cpf[1]*10 + cpf[2]*9 + cpf[3]*8 + cpf[4]*7 + cpf[5]*6 + cpf[6]*5 + cpf[7]*4 + cpf[8]*3 + j*2) % 11;
                                if(k<=1){k = 0}
                                else{k=11-k}
                                if(k != cpf[10]){
                                    await bot.say(`Esse CPF não é válido`);
                                    await flow.repeat();
                                }
                                else{
                                    await bot.say("Obrigada!")
                                }
                            }
                        }
                        else{
                            await bot.say(`Esse CPF não é válido`);
                            await flow.repeat();
                        }
                        */
                    },
                    "cpf",
                    "mainFlow"); 
/*
    flow.addQuestion("Agora preciso da sua *data de aniversário*.\
                    \n _Escreva no formato 01/11/1960_",

                    async(response,flow,bot) =>{


                        const dateRegex = /(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d{3}/
                        if(dateRegex.test(response)){
                            //
                        }
                        else{
                            await bot.say("Essa data de nascimento não é valida. Vamos tentar de novo.")
                            await flow.repeat()
                        }
                    },
                    "birthday",
                    "mainFlow");
*/
    
    flow.addMessage("Ah, se você preferir finalizar nossa conversa, basta digitar *PARAR* a qualquer momento, ok!? 🛑",
                    "mainFlow")

    flow.addMessage("Estamos quase lá! Estou checando as informações e validando a melhor proposta para você! 👩🏻‍💻",
                    "mainFlow")

    flow.addMessage("💡 Enquanto isso, {{vars.firstName}}, confira o *melhor plano para proteção* de toda a sua família!\
                    \n\nEsse é o *plano XXX* com os *benefícios e vantagens XXX*, por apenas _R$ xxx/mês_",
                    "mainFlow")


    flow.addQuestion("Pronto! Dá uma olhada nas condições que consegui para você 💁🏻‍♀ \
    \n\n👉🏼 *Assistência Financeira de R$125.000,00* em 72 parcelas + *Seguro de Acidente Pessoal R$xx,xx*\
    \n 👉🏼 *Assistência Financeira de R$125.000,00* em 72 parcelas\
    \n\nDigita *1* para seguir com a contratação de Assistência Financeira + Seguro de Acidente Pessoal\
    \nDigita *2* para seguir com a contratação de Assistência Financeira\
    \nDigita *3* para saber mais sobre as vantagens do Seguro Sabemi\
    \nQuer uma nova simulação? É só digitar *4*",

                    async(response,flow,bot) =>{
                        if(response=="1"){
                            flow.setVar("af",true);
                            flow.setVar("seguro",true)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("af",true);
                            flow.setVar("seguro",false)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="3"){
                            await flow.gotoThread("newSimulation");                
                        }
                        else if(response =="4"){
                            await flow.gotoThread("newSimulation");
                        }
                        else{
                            await bot.say("Por favor, *digite um número de 1 a 4*, correspondente à ação que quer tomar")
                            await bot.repeat()
                        }
                    },
                    "insitutionChoice",
                    "mainFlow");


    flow.addMessage("Continua comigo!\
                    \nVou te encaminhar um link para *formalizar sua contratação*\
                    Nosso processo é ágil e 100% digital 📱😎",
                    "signUp")


    flow.addMessage("Ah, e já aproveita para deixar os seguintes documentos separados 📑\
                    \n- *Documento de identificação (RG, CNH)*\
                    \n- *Comprovante de residência*\
                    \n- *Contracheque*\
                    \n👉🏼 Logo precisaremos deles!",
                    "signUp")


    flow.addMessage("Aqui esta o link que eu te falei 📲 *www.sabemidigital.com.br*\
                    \nAtravés dele você  dará *continuidade na sua contratação* e ficará ainda mais perto de *realizar os seus sonhos!*",
                    "signUp")

                    
    flow.addMessage("Ah! E se você não tem cadastro no Sabemi Digital ou não lembra sua senha, pode deixar que vou enviar seus dados de acesso por SMS 📩\
                    \nE Se precisar é só me chamar! Basta digitar *SOL* que eu volto 😊",
                    "signUp")

    flow.addQuestion("Me conta sua motivação para uma nova simulação 🧐\
                    \nDigita *1* para: Valor *muito abaixo* do que espero\
                    \nDigital *2* para: Valor *acima* do que preciso para o momento.",

                    async(response,flow,bot) =>{
                        if(response=="1"){
                            await flow.gotoThread("higherValue")
                        }
                        else if(response =="2"){
                            await flow.gotoThread("transferToHuman")
                        }
                        else{
                            await bot.say("Por favor, *digite 1 ou 2*, correspondente à ação que quer tomar")
                            await bot.repeat()
                        }
                    },
                    "insitutionChoice",
                    "newSimulation");

    flow.before("transferToHuman", 
                async(flow,bot)=>{
                    if(await utils.workingHours()){
                        flow.setVar("messageTransfer",
                                    "Entendi! Vou conectar você com um especialista e em breve você será atendido com todo cuidado e qualidade possível 🤗")
                    }
                    else{
                        flow.setVar("messageTransfer",
                                    "Puxa! ⏱ No momento meus colegas estão fora do horário de atendimento, mas a sua mensagem está aqui guardada com a gente\
                                    \nRetorne com um alô, por aqui mesmo, no próximo dia útil entre *09h e 18h*, de *segunda a sexta-feira* e estaremos prontos para te ajudar!\
                                    \nBjs e até breve")
                    }
                }
            );
    flow.addMessage("{{vars.messageTransfer}}","transferToHuman");

    flow.addQuestion("Entendi! Me conta qual *valor você precisa*? 😄\
                    \nAh, para eu compreender, *digite somente os números, com os centavos separados por vírgula*, combinado!?",
                    async(response,flow,bot)=>{
                        
                    },
                    "neededValue",
                    "lowerValue"
    );

    flow.addMessage("Ok! Estou checando se conseguimos outro cenário para te apresentar 👩🏻‍💻[DELAY]","lowerValue")

    flow.addQuestion("{{vars.firstName}}, analisando aqui, verifiquei as possíveis opções para você 💁🏻‍♀\
                    \n👉🏼 Assistência Financeira de *R$125.000,00 em 72 parcelas* + *Seguro de Acidente Pessoal R$xx,xx*\
                    \n👉🏼 Assistência Financeira de *R$125.000,00 em 72 parcelas*\
                    \nDigita *1* para seguir com a contratação de Assistência Financeira + Seguro de Acidente Pessoal\
                    \nDigita *2* para seguir com a contratação de Assistência Financeira\
                    \nDigita *3* para cancelar\
                    \nDigita *4* para falar com um de nossos Especialistas :)",
                    async(response,flow,bot)=>{
                        if(response=="1"){
                            flow.setVar("af",true);
                            flow.setVar("seguro",true)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="2"){
                            flow.setVar("af",true);
                            flow.setVar("seguro",false)
                            await flow.gotoThread("signUp")
                        }
                        else if(response =="3"){
                            await bot.say("Puxa, que pena! 😕\nEspero que a gente converse em outro momento!\
                            \nSe você desejar falar com algum colega Especialista, pode ligar no *0800 000 000*, e estaremos prontos para te atender!\
                            \nAté a próxima!! 🙋🏻")              
                        }
                        else if(response =="4"){
                            await flow.gotoThread("transferToHuman");
                        }
                        else{
                            await bot.say("Por favor, *digite um número de 1 a 4*, correspondente à ação que quer tomar")
                            await bot.repeat()
                        }
                    },
                    "newSimulationChoice",
                    "lowerValue")
    
    flow.addMessage("Sempre que quiser falar comigo, é só me chamar mandando *Sol* 🌞! Até a próxima","endConversation")
    controller.addDialog(flow);
};