# Proxy Interno

## Contexto

Este projeto foi desenvolvido como parte do desafio **Proxy Interno** da disciplina de Técnicas Avançadas de Desenvolvimento de Software, com o objetivo de criar um serviço de proxy interno para consumir a API pública disponível em https://score.hsborges.dev/docs.

O proxy tem como principal função **controlar o acesso à API externa** de forma segura e eficiente, respeitando o limite de 1 requisição por segundo e evitando penalidades em caso de excesso de chamadas. Ele também deve **minimizar a latência** para os clientes internos e **armazenar resultados recentes em cache** para reduzir chamadas repetidas à API externa.

---

## Requisitos atendidos

O proxy implementa os seguintes requisitos obrigatórios do desafio:

1. **Fila/Buffer interno**
    - Lida com picos de requisições internas, armazenando as requisições em uma fila controlada.
2. **Scheduler**
    - Emite no máximo **1 requisição por segundo** para o upstream, garantindo que o rate limit externo não seja violado.
3. **Caching**
    - Memoriza resultados recentes para evitar requisições repetidas à API externa, melhorando performance e evitando penalidades.

Além disso, o proxy atende ao seguinte requisito funcional:

- **RF1:** Exposição do endpoint **GET `/proxy/score`**, que aceita parâmetros da chamada para o upstream.

---

## Padrões de projeto adotados

O projeto utiliza os seguintes padrões clássicos:

1. **Singleton**
    - Aplicado à fila e ao cache (`ProxyStorage`) para garantir **uma única instância** durante a execução do servidor, evitando inconsistências e duplicações de dados.
2. **Command**
    - Cada requisição é encapsulada em um objeto (`ProxyCommand`) que sabe **executar a chamada quando processada pelo scheduler**, desacoplando o recebimento da requisição do processamento real.

> Esses padrões foram escolhidos para deixar o código mais organizado, escalável e fácil de manter, além de deixar explícita a separação de responsabilidades.
> 

---

## Como rodar o projeto

1. Clone ou baixe o projeto.
2. Instale as dependências:

```bash
npm install

```

1. Execute o proxy:

```bash
node index.js

```

1. O servidor ficará disponível na porta **3000**, e o endpoint principal será:

```
GET http://localhost:3000/proxy/score

```
