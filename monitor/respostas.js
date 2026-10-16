'use strict';
// Base de respostas simuladas do Monitor (sem IA, sem API).
// Cada intenção tem padrões sobre o texto normalizado (minúsculas, sem acento).
// Os trechos em "cites" são transcrições literais dos materiais da disciplina.

const FONTES = {
  AC3: { id: 'AC3', title: 'Enunciado da AC3', file: 'AC/IBM4584_AC3_Prototipo_e_teste_rapido.docx' },
  'A0-F010': { id: 'A0-F010', title: 'Como a nota é calculada', file: 'AULAS/AULA0/aula0.tex' },
  'A0-F015': { id: 'A0-F015', title: 'AC3 — Protótipo funcional e teste com usuários', file: 'AULAS/AULA0/aula0.tex' },
  'A0-F018': { id: 'A0-F018', title: 'Política de uso de IA na disciplina', file: 'AULAS/AULA0/aula0.tex' },
  'A0-F019': { id: 'A0-F019', title: 'Calendário do semestre', file: 'AULAS/AULA0/aula0.tex' },
  'A1-F013': { id: 'A1-F013', title: 'Comportamento passado vale mais que opinião futura', file: 'AULAS/AULA1/aula1.tex' },
  'A1-F020': { id: 'A1-F020', title: 'Codificação qualitativa', file: 'AULAS/AULA1/aula1.tex' },
  'A1-F027': { id: 'A1-F027', title: 'Verificação 1 — auditoria de citações', file: 'AULAS/AULA1/aula1.tex' },
  'A1-F035': { id: 'A1-F035', title: 'Frequência não é severidade', file: 'AULAS/AULA1/aula1.tex' },
  'A2-F003': { id: 'A2-F003', title: 'O que é uma persona', file: 'AULAS/AULA2/aula03_personas_jtbd.tex' },
  'A2-F009': { id: 'A2-F009', title: 'O que é Jobs to Be Done', file: 'AULAS/AULA2/aula03_personas_jtbd.tex' },
  'A2-F012': { id: 'A2-F012', title: 'Como escrever um job statement', file: 'AULAS/AULA2/aula03_personas_jtbd.tex' },
  'A3-F006': { id: 'A3-F006', title: 'Proposta de valor', file: 'AULAS/AULA3/aula04.tex' },
  'A4-F010': { id: 'A4-F010', title: 'Escala ordinal não é régua', file: 'AULAS/AULA4/aula05_priorizacao_mvp.tex' },
  'A4-F016': { id: 'A4-F016', title: 'ICE na convenção adotada nesta aula', file: 'AULAS/AULA4/aula05_priorizacao_mvp.tex' },
  'A4-F026': { id: 'A4-F026', title: 'A fórmula de RICE', file: 'AULAS/AULA4/aula05_priorizacao_mvp.tex' },
  'A4-F044': { id: 'A4-F044', title: 'A matriz valor–esforço', file: 'AULAS/AULA4/aula05_priorizacao_mvp.tex' },
  'A4-F063': { id: 'A4-F063', title: 'Minimum Viable Product', file: 'AULAS/AULA4/aula05_priorizacao_mvp.tex' },
  'A4-F064': { id: 'A4-F064', title: 'A unidade mínima depende da aprendizagem', file: 'AULAS/AULA4/aula05_priorizacao_mvp.tex' },
  'A5-F021': { id: 'A5-F021', title: 'Dado, quando, então', file: 'AULAS/AULA5/aula06_arquitetura_solucao.tex' },
  'A6-F006': { id: 'A6-F006', title: 'O espectro de fidelidade', file: 'AULAS/AULA6/aula_2026-09-18_prototipacao_lowcode_I.tex' },
  'A7-F011': { id: 'A7-F011', title: 'As 10 heurísticas de usabilidade de Nielsen', file: 'AULAS/AULA7/aula08-prototipacao-iteracao.tex' },
  'A7-F012': { id: 'A7-F012', title: 'Escala de severidade de Nielsen', file: 'AULAS/AULA7/aula08-prototipacao-iteracao.tex' }
};
const cite = (id, quote) => ({ ...FONTES[id], quote });

const Q = {
  ac3Entrega: 'Entregue o link do protótipo e um registro de teste de uma página contendo:\nProtótipo navegável com quatro a seis telas e somente um fluxo principal.\nUma hipótese testável sobre o comportamento esperado do usuário.\nUma tarefa curta para o participante, sem indicar onde ele deve clicar.\nIdentificação anônima dos dois participantes como P1 e P2.\nAté três achados baseados no que foi observado durante o teste.\nDuas alterações prioritárias ligadas aos achados.\nRegistro sintético de uso de IA, em até meia página adicional.',
  ac3Prazo: 'Período\nRealização e entrega: 16/10/2026',
  ac3Criterios: 'Protótipo e escopo (4,0) — O link funciona, o fluxo é navegável e contém somente quatro a seis telas relevantes.\nTeste rápido (3,0) — Hipótese e tarefa são claras; P1 e P2 foram observados sem condução indevida.\nAchados e decisões (2,0) — Até três achados decorrem do teste e sustentam duas alterações prioritárias.\nClareza e registro de IA (1,0) — A entrega respeita os limites e declara o uso de IA.',
  ac3IA: 'Não é aceitável: Substituir os participantes por personas sintéticas, inventar comportamentos ou feedbacks, ou declarar que o protótipo foi validado apenas porque os participantes gostaram da ideia.\nRegistro sintético obrigatório de IA\nAo final da entrega, registre: ferramenta utilizada; finalidade; prompt principal; contribuição utilizada ou rejeitada; alterações humanas; e forma de verificação.',
  ac3Objetivo: 'Construir um protótipo navegável de um único fluxo e realizar um teste rápido em sala para identificar dificuldades observáveis e escolher ajustes prioritários.\nPonto central: O protótipo não precisa parecer um produto pronto. Ele precisa permitir que outra pessoa tente realizar uma tarefa sem receber instruções sobre onde clicar.',
  ac3Participantes: 'Participantes: duas (ou mais) pessoas de outra equipe.',
  sintetica: 'Persona sintética gerada por IA não substitui usuário real no teste da AC3. Só use se não conseguir trazer um usuário real para teste.',
  mvp: 'Na abordagem Lean Startup, o MVP inicia um ciclo de aprendizagem por meio de uma versão com apenas os elementos necessários para uso por clientes iniciais e coleta de feedback. Na AC2, a definição operacional é mais restrita: o menor conjunto, limitado a três funcionalidades, capaz de testar a promessa central do produto.',
  minimo: '“Mínimo” só pode ser avaliado depois de escrever: a hipótese que será colocada em risco; o comportamento observável do usuário; a evidência que distinguirá os resultados; a decisão que seguirá cada resultado.',
  rice: 'R: pessoas ou eventos alcançados em um período; I: impacto por pessoa ou evento; C: desconto de confiança; E: esforço total em pessoa-mês.',
  ice: 'cada dimensão recebe uma nota de 1 a 10 e o ICE é a média',
  iceVar: 'Há variantes de ICE no mercado. A AC2 deve escrever a fórmula escolhida e citar a fonte, para que o cálculo possa ser reproduzido.',
  ve: 'A matriz posiciona alternativas em dois eixos: valor ou impacto positivo para o cliente; esforço e viabilidade para produzir esse impacto.',
  ordinal: 'Uma escala ordinal preserva a ordem, mas não garante distâncias iguais entre categorias.',
  jtbd: 'Job to Be Done é o progresso que uma pessoa está tentando fazer em uma dada circunstância. O produto é “contratado” para realizar esse trabalho.',
  jobStatement: 'Quando [situação], quero [motivação], para que [resultado esperado].',
  livreSolucao: 'Bom job statement é livre de solução: não menciona “app”, “botão” nem “IA”.',
  persona: 'Persona é uma representação arquetípica de um segmento de usuários, construída a partir de evidência, usada para dar rosto e comportamento a um grupo com necessidades semelhantes.',
  pv: 'Uma proposta de valor descreve os benefícios que o cliente pode esperar dos seus produtos e serviços, para um segmento específico de clientes.',
  pvSlogan: 'Se a proposta de valor da sua equipe sobrevive a qualquer resultado de pesquisa, ela não é uma proposta de valor: é um slogan.',
  codificacao: 'Codificação (coding) é atribuir a cada trecho de texto um rótulo curto que sintetiza o que ali está sendo dito, de modo que trechos comparáveis recebam o mesmo rótulo.',
  codebook: 'Sem codebook escrito, duas pessoas — ou duas execuções do mesmo modelo — produzem rótulos diferentes para o mesmo trecho, e a contagem final deixa de significar qualquer coisa.',
  auditoria: 'Pergunta: os trechos citados existem literalmente no material de origem? Sortear uma amostra aleatória das linhas da saída. Buscar cada citação, caractere a caractere, no arquivo de origem.',
  freqSev: 'Ordene temas por consequência mensurável, usando a contagem apenas como indício de alcance — nunca como critério único de prioridade.',
  severidade: 'A severidade de um problema combina três fatores — frequência (é comum ou raro?), impacto (é fácil ou difícil de contornar?) e persistência (incomoda uma vez ou sempre?)',
  heuristicas: 'H1 Visibilidade do estado do sistema — Depois de cada ação, o usuário sabe o que aconteceu?\nH2 Correspondência com o mundo real — Os textos usam as palavras do usuário, não as do time?\nH3 Controle e liberdade — Dá para cancelar, voltar ou desfazer sem sofrimento?',
  entrevista: 'Perguntas sobre o futuro convidam à cortesia e à especulação. Perguntas sobre o passado recuperam fatos verificáveis.',
  fidelidade: 'Regra prática: Fidelidade mínima suficiente para testar a hipótese da vez.',
  gherkin: 'Dado estabelece o contexto. Quando define o evento. Então descreve uma saída observável.',
  politicaIA: 'Uso inaceitável: Inventar usuários, dados ou citações. Entregar texto que a equipe não sabe defender. […] Apresentar saída de IA como evidência empírica.',
  registroIA: 'Toda AC inclui um breve registro de uso de IA: onde foi usada, com qual finalidade e o que a equipe verificou antes de aceitar a saída.',
  nota: 'Média Final = 0,4 AP1 + 0,4 AP2 + 0,2 AC\nAprovado com Média Final ≥ 7,0 e frequência ≥ 75%.',
  calendario: '16/10 Feedback qualitativo — entrega AC3\n23/10 Métricas — início AC4\n30/10 Causalidade e IA agêntica\n06/11 Go-to-market — entrega AC4'
};

const LIM = {
  padrao: 'Resposta montada a partir de trechos selecionados. Confira o material original antes de usar em uma entrega.',
  ac3: 'O enunciado oficial da AC3 prevalece sobre esta resposta. Interpretações sobre casos específicos da sua equipe devem ser confirmadas com o professor.',
  exercicio: 'Exercícios autorais de estudo, não são questões oficiais nem indicam o conteúdo das provas.',
  semFonte: 'Não há trecho nos materiais consultados que sustente uma resposta. Não trate sugestões como regra da disciplina.'
};

// Ordem importa: guardrails primeiro, depois intenções específicas, depois genéricas.
const INTENCOES = [
  {
    id: 'guard_nota', tipo: 'limite',
    test: t => /(alter|mud|aument|lanc|corrig|coloc|atualiz|edit)\w*\b.{0,30}\bnotas?\b|\bnotas?\b.{0,25}\b(para|pra)\s+(10|dez|9|nove)\b|\bminha nota\b|\bminhas notas\b|\bnota (que )?(eu )?tirei\b/.test(t),
    answer: 'Não consigo consultar nem alterar notas. Este monitor tem acesso apenas a materiais selecionados da disciplina (aulas e enunciado da AC3) e não se conecta ao sistema acadêmico.\n\nNenhuma alteração foi feita. Para dúvidas sobre a sua nota, fale diretamente com o professor.',
    cites: [], limits: 'O monitor não acessa dados de alunos. Esta resposta descreve um limite do produto, não uma regra da disciplina.'
  },
  {
    id: 'guard_fazer_atividade', tipo: 'limite',
    test: t => /^(por favor,?\s*)?(pode\s+|poderia\s+|consegue\s+)?(faca|faz|fazer|escreva|escreve|escrever|redija|redigir|elabore|elaborar|gere|gerar|crie|criar|monte|montar)\b.{0,60}\b(minha|nossa|meu|nosso)\b.{0,30}\b(ac3|ac 3|registro|hipotese|tarefa|achados|entrega|trabalho|relatorio)\b/.test(t)
      || /\b(faca|faz|escreva|redija|elabore)\b.{0,15}\b(a|o)\s+(ac3|ac 3|registro do teste|registro de teste)\b/.test(t),
    answer: 'Não vou produzir a entrega por você, mas posso ajudar a revisar o que a sua equipe escreveu.\n\nUm caminho: escreva a sua hipótese e a sua tarefa e me pergunte se elas estão coerentes. Lembre que, pelo enunciado, os achados precisam vir do que foi observado com participantes reais, e não de comportamentos inventados. [AC3]',
    cites: [cite('AC3', Q.ac3IA)], limits: LIM.ac3
  },
  {
    id: 'sem_evidencia', tipo: 'sem_evidencia',
    test: t => /segunda correcao|recorrecao|re-?correcao|revisao (de|da) (prova|nota|ac)|recurso (de|da) (prova|nota)|abono|abonar|justificar falta|atestado|reposicao|segunda chamada|2a chamada|prova substitutiva.*(data|dia|quando)|trancar|trancamento/.test(t),
    answer: 'Não encontrei essa informação nos materiais consultados.\n\nOs materiais disponíveis aqui são as aulas da disciplina e o enunciado da AC3; nenhum deles traz regras ou prazos sobre esse assunto. Não vou propor uma data ou procedimento para não criar uma regra que não existe. Consulte o professor ou a secretaria acadêmica.',
    cites: [], limits: LIM.semFonte
  },
  {
    id: 'ac3_prazo', tipo: 'ac3',
    test: t => /\bac ?3\b/.test(t) && /prazo|quando|data|dia\b|entregar ate|ate quando|horario/.test(t),
    answer: 'Pelo enunciado, a realização e a entrega da AC3 acontecem em 16/10/2026. [AC3]\n\nO enunciado consultado não informa horário limite. Se você precisa dessa informação, confirme com o professor.',
    cites: [cite('AC3', Q.ac3Prazo)], limits: LIM.ac3
  },
  {
    id: 'ac3_criterios', tipo: 'ac3',
    test: t => /\bac ?3\b/.test(t) && /criterio|pontua|quanto vale|vale quanto|peso|rubrica|correcao|corrigid|avaliad|nota da ac|como (e|sera) avaliad/.test(t),
    answer: 'A AC3 é corrigida em quatro critérios: [AC3]\n\n• Protótipo e escopo — 4,0 pontos\n• Teste rápido — 3,0 pontos\n• Achados e decisões — 2,0 pontos\n• Clareza e registro de IA — 1,0 ponto\n\nO enunciado também avisa que itens adicionais não aumentam a nota.',
    cites: [cite('AC3', Q.ac3Criterios)], limits: LIM.ac3
  },
  {
    id: 'ac3_ia', tipo: 'ac3',
    test: t => /\bac ?3\b/.test(t) && /\bia\b|inteligencia artificial|chatgpt|gemini|claude|sintetic|registro de ia|uso de ia/.test(t),
    answer: 'Na AC3, a IA pode apoiar a criação das telas, sugerir formulações de hipótese ou tarefa e ajudar a organizar os registros da equipe. [AC3]\n\nNão é aceitável substituir os participantes por personas sintéticas, inventar comportamentos ou feedbacks, ou declarar o protótipo validado só porque os participantes gostaram da ideia. A entrega precisa de um registro sintético do uso de IA: ferramenta, finalidade, prompt principal, contribuição usada ou rejeitada, alterações humanas e forma de verificação. [AC3] [A0-F015]',
    cites: [cite('AC3', Q.ac3IA), cite('A0-F015', Q.sintetica)], limits: LIM.ac3
  },
  {
    id: 'ac3_participantes', tipo: 'ac3',
    test: t => /\bac ?3\b/.test(t) && /participante|p1|p2|quantas pessoas|quantos usuarios|com quem|usuario real/.test(t),
    answer: 'O enunciado pede duas (ou mais) pessoas de outra equipe como participantes, identificadas de forma anônima como P1 e P2. [AC3]\n\nPersona sintética gerada por IA não substitui usuário real no teste. [A0-F015]',
    cites: [cite('AC3', Q.ac3Participantes), cite('A0-F015', Q.sintetica)], limits: LIM.ac3
  },
  {
    id: 'ac3_registro', tipo: 'ac3',
    test: t => /\bac ?3\b|registro (do|de) teste|terceira ac|ac tres/.test(t),
    answer: 'Pelo enunciado da AC3, a equipe entrega o link do protótipo e um registro de teste de uma página contendo: [AC3]\n\n1. Protótipo navegável com quatro a seis telas e um único fluxo principal.\n2. Uma hipótese testável sobre o comportamento esperado do usuário.\n3. Uma tarefa curta, sem indicar onde o participante deve clicar.\n4. Identificação anônima dos participantes como P1 e P2.\n5. Até três achados baseados no que foi observado no teste.\n6. Duas alterações prioritárias ligadas aos achados.\n7. Registro sintético de uso de IA, em até meia página adicional.\n\nO trecho de origem está no botão da fonte, abaixo.',
    cites: [cite('AC3', Q.ac3Entrega)], limits: LIM.ac3
  },
  {
    id: 'exercicios', tipo: 'exercicio',
    test: t => /questo|exercicio|lista de estudo|quiz|simulado|praticar|pratica\b|treinar|me (ajuda|ajude) a estudar|estudar|revisar para|revisao para|ap2|prova/.test(t),
    answer: null, cites: [], limits: LIM.exercicio
  },
  {
    id: 'hipotese_tarefa', tipo: 'conceito',
    test: t => /hipotese/.test(t) && /tarefa/.test(t),
    answer: 'Hipótese e tarefa cumprem funções diferentes no teste:\n\n• Hipótese é uma expectativa testável sobre o comportamento do usuário — algo que o teste pode contrariar. Ex.: “o estudante encontra uma exigência da AC3 e confere a fonte sem ajuda”.\n• Tarefa é a situação que você apresenta ao participante para que o comportamento possa aparecer — curta e sem indicar onde clicar. [AC3]\n\nA tarefa serve à hipótese: se ela não cria a situação em que o comportamento esperado poderia ocorrer, o teste não produz evidência sobre a hipótese. Para decidir o escopo, escreva antes a hipótese, o comportamento observável e a decisão que seguirá cada resultado. [A4-F064]',
    cites: [cite('AC3', 'Uma hipótese testável sobre o comportamento esperado do usuário.\nUma tarefa curta para o participante, sem indicar onde ele deve clicar.'), cite('A4-F064', Q.minimo)], limits: LIM.padrao
  },
  {
    id: 'hipotese', tipo: 'conceito',
    test: t => /hipotese/.test(t),
    answer: 'Uma hipótese testável declara uma expectativa que pode ser contrariada pelo que você observar. Na AC3, ela deve tratar do comportamento esperado do usuário. [AC3]\n\nUm bom teste é escrever o que contrariaria a hipótese antes de executar. Se nenhum resultado possível a contraria, ela ainda não é testável. Para que a hipótese oriente o escopo, registre também o comportamento observável, a evidência e a decisão que seguirá cada resultado. [A4-F064]',
    cites: [cite('AC3', 'Uma hipótese testável sobre o comportamento esperado do usuário.'), cite('A4-F064', Q.minimo)], limits: LIM.padrao
  },
  {
    id: 'tarefa', tipo: 'conceito',
    test: t => /\btarefa\b/.test(t) && /teste|participante|usuario|escrever|boa|como/.test(t),
    answer: 'A tarefa é o que você pede ao participante durante o teste. Pelo enunciado da AC3, ela deve ser curta e não indicar onde a pessoa deve clicar. [AC3]\n\nUma tarefa que diz “clique em Relatórios” mede se a pessoa segue instruções, e não se ela encontra o caminho. Prefira descrever uma situação e um objetivo: “Você precisa saber quanto gastou no mês passado.”',
    cites: [cite('AC3', 'Uma tarefa curta para o participante, sem indicar onde ele deve clicar.')], limits: LIM.padrao
  },
  {
    id: 'rice', tipo: 'conceito',
    test: t => /\brice\b/.test(t),
    answer: 'RICE prioriza combinando quatro componentes: [A4-F026]\n\n• R (Reach): pessoas ou eventos alcançados em um período;\n• I (Impact): impacto por pessoa ou evento;\n• C (Confidence): desconto de confiança;\n• E (Effort): esforço total, em pessoa-mês.\n\nO escore é RICE = (R × I × C) / E. Cuidado: notas em escala ordinal preservam a ordem, mas não garantem distâncias iguais, então multiplicar e dividir essas notas acrescenta uma hipótese. [A4-F010]',
    cites: [cite('A4-F026', Q.rice), cite('A4-F010', Q.ordinal)], limits: LIM.padrao
  },
  {
    id: 'ice', tipo: 'conceito',
    test: t => /\bice\b/.test(t),
    answer: 'Na convenção usada na disciplina, ICE avalia Impacto, Confiança e Facilidade (Ease) com notas de 1 a 10, e o escore é a média das três. [A4-F016]\n\nExistem variantes de ICE no mercado (algumas multiplicam em vez de tirar a média). Por isso, a AC2 pedia que a equipe escrevesse a fórmula escolhida e citasse a fonte. [A4-F016]',
    cites: [cite('A4-F016', Q.ice + '\n' + Q.iceVar)], limits: LIM.padrao
  },
  {
    id: 'valor_esforco', tipo: 'conceito',
    test: t => /valor\s*(x|vs|versus|e|-)?\s*esforco|value\s*(vs|x)?\s*effort|matriz/.test(t),
    answer: 'A matriz valor × esforço posiciona as alternativas em dois eixos: valor (impacto positivo para o cliente) e esforço/viabilidade para produzir esse impacto. Os quadrantes separam alto valor/baixo esforço, alto valor/alto esforço, baixo valor/baixo esforço e baixo valor/alto esforço. [A4-F044]',
    cites: [cite('A4-F044', Q.ve)], limits: LIM.padrao
  },
  {
    id: 'priorizacao', tipo: 'conceito',
    test: t => /prioriz/.test(t),
    answer: 'A disciplina trabalhou três modelos de priorização:\n\n• ICE — média de Impacto, Confiança e Facilidade, de 1 a 10. [A4-F016]\n• RICE — (Alcance × Impacto × Confiança) / Esforço. [A4-F026]\n• Valor × Esforço — matriz de dois eixos com quatro quadrantes. [A4-F044]\n\nEles respondem a perguntas diferentes; escolha o método pelo objetivo da decisão, não pelo resultado que você prefere. Quer que eu explique um deles ou monte exercícios?',
    cites: [cite('A4-F016', Q.ice), cite('A4-F026', Q.rice), cite('A4-F044', Q.ve)], limits: LIM.padrao
  },
  {
    id: 'mvp', tipo: 'conceito',
    test: t => /\bmvp\b|produto minimo|minimo viavel|minimum viable/.test(t),
    answer: 'Na abordagem Lean Startup, o MVP inicia um ciclo de aprendizagem com apenas os elementos necessários para uso por clientes iniciais e coleta de feedback. Na AC2, a definição foi mais restrita: o menor conjunto, de até três funcionalidades, capaz de testar a promessa central do produto. [A4-F063]\n\n“Mínimo” só pode ser avaliado depois de escrever a hipótese em risco, o comportamento observável, a evidência que distinguirá os resultados e a decisão que seguirá cada resultado. [A4-F064]',
    cites: [cite('A4-F063', Q.mvp), cite('A4-F064', Q.minimo)], limits: LIM.padrao
  },
  {
    id: 'jtbd', tipo: 'conceito',
    test: t => /jtbd|jobs? to be done|job statement|\bjob\b/.test(t),
    answer: 'Job to Be Done é o progresso que uma pessoa está tentando fazer em uma dada circunstância; o produto é “contratado” para realizar esse trabalho. [A2-F009]\n\nUm formato para escrever: “Quando [situação], quero [motivação], para que [resultado esperado].” Um bom job statement é livre de solução: não menciona app, botão nem IA. [A2-F012]',
    cites: [cite('A2-F009', Q.jtbd), cite('A2-F012', Q.jobStatement + '\n' + Q.livreSolucao)], limits: LIM.padrao
  },
  {
    id: 'persona', tipo: 'conceito',
    test: t => /persona/.test(t),
    answer: 'Persona é uma representação arquetípica de um segmento de usuários, construída a partir de evidência, para dar rosto e comportamento a um grupo com necessidades semelhantes. [A2-F003]\n\nAtenção para a AC3: persona sintética gerada por IA não substitui usuário real no teste. [A0-F015]',
    cites: [cite('A2-F003', Q.persona), cite('A0-F015', Q.sintetica)], limits: LIM.padrao
  },
  {
    id: 'proposta_valor', tipo: 'conceito',
    test: t => /proposta de valor|value proposition|canvas|vpc/.test(t),
    answer: 'Uma proposta de valor descreve os benefícios que o cliente pode esperar dos seus produtos e serviços, para um segmento específico de clientes. [A3-F006]\n\nUm teste útil: se a proposta sobrevive a qualquer resultado de pesquisa, ela não é uma proposta de valor — é um slogan. [A3-F006]',
    cites: [cite('A3-F006', Q.pv + '\n' + Q.pvSlogan)], limits: LIM.padrao
  },
  {
    id: 'feedback_qualitativo', tipo: 'conceito',
    test: t => /codifica|codebook|feedback|qualitativ|sintese|\btemas?\b|analis\w* (de|das|dos) (entrevista|resposta|relato)/.test(t),
    answer: 'Para analisar feedback qualitativo, a disciplina usa codificação: atribuir a cada trecho um rótulo curto, de modo que trechos comparáveis recebam o mesmo rótulo. Sem um codebook escrito, duas pessoas — ou duas execuções do mesmo modelo — rotulam o mesmo trecho de forma diferente. [A1-F020]\n\nSe usar IA, audite as citações: sorteie linhas da saída e procure cada trecho, caractere a caractere, no material original. [A1-F027]',
    cites: [cite('A1-F020', Q.codificacao + '\n' + Q.codebook), cite('A1-F027', Q.auditoria)], limits: LIM.padrao
  },
  {
    id: 'severidade', tipo: 'conceito',
    test: t => /severidade|gravidade|nielsen|heuristic/.test(t),
    answer: 'A severidade de um problema de usabilidade combina frequência, impacto e persistência, e costuma ser resumida em uma nota de 0 (não é problema) a 4 (catástrofe). [A7-F012]\n\nFrequência sozinha não define prioridade: ordene os temas pela consequência e use a contagem apenas como indício de alcance. [A1-F035]',
    cites: [cite('A7-F012', Q.severidade), cite('A1-F035', Q.freqSev)], limits: LIM.padrao
  },
  {
    id: 'entrevista', tipo: 'conceito',
    test: t => /entrevista|perguntar ao usuario|perguntas? (para|pro|ao) (o )?(usuario|participante)/.test(t),
    answer: 'Prefira perguntas sobre o passado às perguntas sobre o futuro. Perguntas sobre o futuro convidam à cortesia e à especulação; perguntas sobre o passado recuperam fatos verificáveis. [A1-F013]\n\nEm vez de “Você usaria isso?”, pergunte “Quando foi a última vez que isso te atrapalhou? O que aconteceu?”',
    cites: [cite('A1-F013', Q.entrevista)], limits: LIM.padrao
  },
  {
    id: 'prototipo', tipo: 'conceito',
    test: t => /prototip|fidelidade|wireframe|\bv0\b|lovable|figma|mockup/.test(t),
    answer: 'A regra prática da disciplina é usar a fidelidade mínima suficiente para testar a hipótese da vez. Um protótipo navegável serve para testar fluxo completo e usabilidade; não valida carga, segurança ou escala. [A6-F006]\n\nNa AC3, o protótipo deve ter de quatro a seis telas e um único fluxo principal. [AC3]',
    cites: [cite('A6-F006', Q.fidelidade), cite('AC3', 'Protótipo navegável com quatro a seis telas e somente um fluxo principal.')], limits: LIM.padrao
  },
  {
    id: 'requisitos', tipo: 'conceito',
    test: t => /requisito|historia de usuario|user stor|criterio de aceita|gherkin|dado.*quando.*entao/.test(t),
    answer: 'Critérios de aceitação podem ser escritos no formato Dado / Quando / Então: “Dado” estabelece o contexto, “Quando” define o evento e “Então” descreve uma saída observável. [A5-F021]',
    cites: [cite('A5-F021', Q.gherkin)], limits: LIM.padrao
  },
  {
    id: 'politica_ia', tipo: 'conceito',
    test: t => /(posso|pode|podemos) usar (a )?(ia|chatgpt|gemini|claude|inteligencia)|uso de ia|politica de ia|usar ia/.test(t),
    answer: 'A disciplina espera uso de IA para sintetizar pesquisa e feedback, gerar variações, construir protótipos e explorar hipóteses. É inaceitável inventar usuários, dados ou citações, entregar texto que a equipe não sabe defender ou apresentar saída de IA como evidência empírica. [A0-F018]\n\nToda AC inclui um breve registro de uso de IA: onde foi usada, com qual finalidade e o que a equipe verificou antes de aceitar a saída. [A0-F018]',
    cites: [cite('A0-F018', Q.politicaIA + '\n' + Q.registroIA)], limits: LIM.padrao
  },
  {
    id: 'media_final', tipo: 'conceito',
    test: t => /media final|calculo da (media|nota)|como (e|sera) calculad|composicao da nota|ap1|ap2|frequencia minima|reprova/.test(t),
    answer: 'A média final da disciplina é 0,4 × AP1 + 0,4 × AP2 + 0,2 × AC. É aprovado quem tem média final ≥ 7,0 e frequência ≥ 75%. A AS é facultativa e substitui a menor nota entre AP1 e AP2. [A0-F010]',
    cites: [cite('A0-F010', Q.nota)], limits: 'Regra geral da disciplina. O monitor não consulta notas individuais.'
  },
  {
    id: 'calendario', tipo: 'conceito',
    test: t => /calendario|cronograma|proxima aula|proximas aulas|ac ?4|quando (e|sera|comeca)/.test(t),
    answer: 'Pelo calendário apresentado na primeira aula: 16/10 — feedback qualitativo e entrega da AC3; 23/10 — métricas e início da AC4; 30/10 — causalidade e IA agêntica; 06/11 — go-to-market e entrega da AC4. [A0-F019]',
    cites: [cite('A0-F019', Q.calendario)], limits: 'Calendário da primeira aula. Avisos posteriores do professor prevalecem.'
  },
  {
    id: 'saudacao', tipo: 'conversa',
    test: t => /^(oi+|ola|opa|bom dia|boa tarde|boa noite|e ai|hello|hey|tudo bem)\b/.test(t) && t.split(' ').length <= 5,
    answer: 'Olá! Eu sou o Monitor da disciplina Gestão de Produtos com IA. Posso explicar conceitos das aulas (MVP, priorização, JTBD, testes rápidos…), consultar o enunciado da AC3 e montar exercícios de estudo. Sempre que possível, mostro de qual material veio a resposta. Qual é a sua dúvida?',
    cites: [], limits: 'O monitor não acessa notas nem dados dos alunos.'
  },
  {
    id: 'agradecimento', tipo: 'conversa',
    test: t => /^(obrigad|valeu|vlw|brigad|thanks|perfeito|show|otimo|massa)/.test(t) && t.split(' ').length <= 6,
    answer: 'De nada! Se quiser, confira a fonte da resposta no botão abaixo dela. Posso ajudar com mais alguma coisa?',
    cites: [], limits: ''
  },
  {
    id: 'capacidades', tipo: 'conversa',
    test: t => /quem (e|es) (voce|vc)|o que (voce|vc) (faz|sabe|pode)|como (voce|vc) funciona|como funciona|para que serve|^ajuda$|^help$/.test(t),
    answer: 'Sou um monitor de estudo da disciplina. Consigo:\n• explicar conceitos das aulas 0 a 7;\n• consultar o enunciado da AC3;\n• montar exercícios de estudo (sem gabarito inicial).\n\nNão consigo: consultar ou alterar notas, fazer a atividade por você ou responder sobre assuntos fora dos materiais. Quando cito um material, você pode abrir o trecho no botão abaixo da resposta.',
    cites: [], limits: 'O monitor não acessa notas nem dados dos alunos.'
  }
];

const EXERCICIOS = {
  priorizacao: {
    test: t => /prioriz|rice|\bice\b|valor.*esforco|effort/.test(t),
    answer: 'Exercícios autorais de estudo sobre priorização (sem gabarito por enquanto):\n\n1. Aplicação — Uma funcionalidade alcança 400 pessoas por trimestre, tem impacto 2, confiança 50% e esforço de 2 pessoas-mês. Calcule o RICE e explique o que cada termo representa.\n2. Comparação — Duas equipes priorizam as mesmas funcionalidades, uma com ICE e outra com RICE, e chegam a rankings diferentes. Que diferença entre os métodos pode explicar isso?\n3. Análise de erro — Uma equipe calcula “valor dividido por esforço” usando notas de 1 a 5 e conclui que a opção A é “2,5 vezes melhor” que a B. O que há de problemático nessa conclusão?\n\nQuando terminar, me envie suas respostas para eu comentar. Os conceitos estão nas fontes abaixo.',
    cites: [cite('A4-F026', Q.rice), cite('A4-F016', Q.ice), cite('A4-F010', Q.ordinal)]
  },
  mvp: {
    test: t => /\bmvp\b|minimo viavel/.test(t),
    answer: 'Exercícios autorais de estudo sobre MVP (sem gabarito por enquanto):\n\n1. Aplicação — Um aplicativo tem dez funções planejadas. Que fluxo mínimo permitiria testar a promessa central?\n2. Comparação — Qual a diferença entre o MVP da abordagem Lean Startup e a definição operacional usada na AC2?\n3. Análise de erro — Uma equipe incluiu todas as funções pedidas pelos usuários e chamou o resultado de MVP. Que critério de escopo faltou?\n\nQuando terminar, me envie suas respostas para eu comentar.',
    cites: [cite('A4-F063', Q.mvp), cite('A4-F064', Q.minimo)]
  },
  jtbd: {
    test: t => /jtbd|job|persona/.test(t),
    answer: 'Exercícios autorais de estudo sobre personas e JTBD (sem gabarito por enquanto):\n\n1. Aplicação — Escreva um job statement no formato “Quando…, quero…, para que…” para um estudante que prepara a entrega de um trabalho em grupo.\n2. Comparação — Em que situação uma persona ajuda mais que um job statement, e vice-versa?\n3. Análise de erro — “Quando abro o app, quero clicar no botão de IA para gerar o resumo.” O que está errado neste job statement?\n\nQuando terminar, me envie suas respostas para eu comentar.',
    cites: [cite('A2-F012', Q.jobStatement + '\n' + Q.livreSolucao), cite('A2-F003', Q.persona)]
  },
  teste: {
    test: t => /teste|hipotese|tarefa|usabilidade|feedback/.test(t),
    answer: 'Exercícios autorais de estudo sobre testes rápidos (sem gabarito por enquanto):\n\n1. Aplicação — Escreva uma hipótese testável e uma tarefa para o fluxo principal do protótipo da sua equipe.\n2. Comparação — Qual a diferença entre um participante dizer que “gostou” e um participante concluir a tarefa sem ajuda?\n3. Análise de erro — A tarefa “Clique em Relatórios e exporte o PDF” tem um problema. Qual?\n\nQuando terminar, me envie suas respostas para eu comentar.',
    cites: [cite('AC3', 'Uma hipótese testável sobre o comportamento esperado do usuário.\nUma tarefa curta para o participante, sem indicar onde ele deve clicar.')]
  }
};

const STOP = new Set('a o e de do da dos das os as um uma uns umas para pra com que em no na nos nas por pelo pela eu voce vc quero pode posso quais qual como explique explica sobre usando use me te se ser sao e eh isso esse essa este esta aqui ali la mais menos muito pouco tem ter tenho preciso gostaria saber falar diga dizer fale disciplina monitor aula aulas materia gestao produto produtos ia o que quem quiser onde quando quais porque qual ganhou fazer feito tudo algum alguma coisa sobre'.split(' '));

function normalizar(texto) {
  return (texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9?!. ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function buscarTitulos(t, fontes) {
  const termos = t.split(' ').filter(w => w.length > 3 && !STOP.has(w));
  if (!termos.length) return [];
  const pontuadas = fontes.map(f => {
    const titulo = normalizar(f.title);
    let s = 0;
    for (const w of termos) if (titulo.includes(w.slice(0, Math.max(4, w.length - 2)))) s++;
    return [s, f];
  }).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]);
  return pontuadas.slice(0, 3).map(([, f]) => f);
}

// Responde a uma pergunta. Retorna {intent, tipo, answer, citations, limitations, fallback}.
function responder(pergunta, fontes, anterior) {
  const t = normalizar(pergunta);
  if (!t) return null;
  for (const it of INTENCOES) {
    if (!it.test(t)) continue;
    if (it.id === 'exercicios') {
      // usa o tema da pergunta ou, se não houver, o tema da conversa anterior
      const base = t + ' ' + normalizar(anterior || '');
      for (const [nome, ex] of Object.entries(EXERCICIOS)) {
        if (ex.test(t) || (!Object.values(EXERCICIOS).some(e => e.test(t)) && ex.test(base))) {
          return { intent: 'exercicios_' + nome, tipo: 'exercicio', answer: ex.answer, citations: ex.cites, limitations: LIM.exercicio, fallback: false };
        }
      }
      if (/ap2|prova/.test(t) && !/estud|pratic|exercic|questo|treinar|revis/.test(t)) continue;
      return { intent: 'exercicios_sem_tema', tipo: 'exercicio', answer: 'Posso montar exercícios de estudo sobre um destes temas: priorização (ICE, RICE, valor × esforço), MVP, personas e JTBD, ou testes rápidos. Qual deles você quer praticar?', citations: [], limitations: LIM.exercicio, fallback: false };
    }
    return { intent: it.id, tipo: it.tipo, answer: it.answer, citations: it.cites, limitations: it.limits, fallback: false };
  }
  const sugestoes = buscarTitulos(t, fontes || []);
  if (sugestoes.length) {
    return {
      intent: 'fallback_com_sugestao', tipo: 'fallback',
      answer: 'Não encontrei uma resposta direta para essa pergunta nos materiais consultados.\n\nEncontrei materiais com títulos parecidos, que talvez ajudem. Você pode abri-los nos botões abaixo ou reformular a pergunta com outras palavras.',
      citations: sugestoes.map(f => ({ ...f, quote: '' })), limitations: LIM.semFonte, fallback: true
    };
  }
  return {
    intent: 'fallback', tipo: 'fallback',
    answer: 'Não encontrei essa informação nos materiais consultados.\n\nTente reformular a pergunta usando termos das aulas (por exemplo: MVP, priorização, JTBD, AC3, teste rápido) ou consulte a lista de materiais da disciplina.',
    citations: [], limitations: LIM.semFonte, fallback: true
  };
}

window.MonitorRespostas = { responder, normalizar };
