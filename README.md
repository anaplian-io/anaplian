# **@anaplian**

**Long-running AI Agents**

## **What**

Anaplian is an AI agent framework written in TypeScript and designed to interop with LangChain.js.

## **Why**

Anaplian is specifically built for _long-running_ AI agents.

**Do you need an agent that:**

- Has a long life cycle?
- Has an open-ended objective?
- Is completely customizable?

Then Anaplian might be a good framework in which to build your agent! If your agents are short-lived, finite state machines,
chatbots, or need partitioned memories, you might want to consider another framework.

Anaplian was written according to the following basic tenets:

1. **Everything is an action!** Every time the model is invoked, it _must_ select an action.
2. **No special treatment!** There is no "core" library of actions always available to an agent. The agent may only exercise the actions that you provide.
   The same goes for items in the context. Don't like the agent history that ships with Anaplian? Feel free to substitute your own that does exactly what
   need.
3. **Come as you are!** Anaplian is designed to be agnostic to the underlying model that is invoked. As long as it implements LangChain's `BaseLlm` or
   `BaseChatModel`, it will run. If it doesn't, that's a bug! However, models with a context window size of at least 100,000 tokens are recommended.
4. **No templating!** Anaplian will handle all prompt formatting so that developers can write code instead of prompt templates.

Anaplian is written in TypeScript and supported in Node.js 18.x, 20.x, and 22.x.

**Intended use cases include:**

- Research and report preparation
- System monitoring
- Automated incident response

## **Getting Started**

```shell
npm install --save @anaplian/core
```

`@anaplian/core` contains the base runtime and a very small number of basic actions and context providers.

This code builds a very basic model then runs it. See [packages/djan-seriy](https://github.com/anaplian-io/anaplian/tree/main/packages/djan-seriy)
for a full example agent.

```typescript
const modelName = 'gpt-4o-mini';
new AgentBuilder({
  modelName,
  roleAssignmentDirective:
    'You are a poet writing a sonnet. Brainstorm several topics using the "think" action and refine your idea. Then use the "think" action to write your sonnet. After have written your sonnet, use the "nop" action.',
  model: new ChatOpenAI({
    apiKey: 'your-api-key',
    model: modelName,
    streaming: false,
    temperature: 0,
  }),
})
  .addAction(new NopAction())
  .addAction(new ThinkAction())
  .addContextProvider(new HistoryContextProvider({}), 99.5) // 99.5% of the available context window will be allocated to history
  .addContextProvider(new DateContextProvider(), 0.5) // 0.5% of the available context window will be allocated to the current date
  .setOn('fatalError', (error) => console.error(error)) // if a fatal error occurs, log it to the console
  .build()
  .then((agent) => agent.run());
```

## **Concepts**

The two primary components to an Anaplian agent are **Actions** and **Context Providers**.

### **Context Providers**

Before the model is invoked, its context is constructed from a set of providers. The context informs the agent about how it will act.
The `HistoryContextProvider` is arguably the most important provider as without it, the agent will have no knowledge about what it
has done.

### **Actions**

After the context has been rendered, the agent must select an action to execute. These are actions are selected from a list of
actions provided when the agent was built. The `Action` interface includes documentation that is provided to the agent about what the action
does, how to use it, and examples.

## **Packages**

- `@anaplian/core` - The Anaplian agent runtime.
- `@anaplian/model-context-size` - Gets the context window size of a model.
- `@anaplian/web` - Provides agent plugins for interacting with the web.
- `@anaplian/djan-seriy` (not published) - A runnable example agent.

## **Contributing**

Contributions are always welcome! Please [fork and merge](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project) to suggest
a contribution. The more actions and context providers that are available, the more useful Anaplian agents will be.
