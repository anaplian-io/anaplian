# **@anaplian/model-context-size**

A lightweight utility module for managing and retrieving context window sizes for various language models.

---

## **Features**

- Provides context size information for large language models.
- Includes type safety for model names.

---

## **Installation**

```bash
npm install @anaplian/model-context-size
```

---

## **Usage**

### **Import the module**

```typescript
import {
  getModelContextSize,
  isModelSupported,
} from '@anaplian/model-context-size';
```

### **Check if a model is supported**

```typescript
const modelName = 'gpt-4';
if (isModelSupported(modelName)) {
  console.log(`\${modelName} is supported.`);
} else {
  console.log(`\${modelName} is not supported.`);
}
```

### **Get the context size of a supported model**

```typescript
const modelName = 'gpt-4';
if (isModelSupported(modelName)) {
  const contextSize = getModelContextSize(modelName);
  console.log(`Context size for \${modelName}: \${contextSize} tokens`);
}
```

---

## **API Reference**

### **Functions**

#### `isModelSupported(modelName: string): boolean`

**Description:**  
Checks whether the given model name is supported.

**Parameters:**

- `modelName` _(string)_ - The name of the model to check.

**Returns:**

- `boolean` - `true` if the model is supported, otherwise `false`.

---

#### `getModelContextSize(modelName: SupportedModelName): number`

**Description:**  
Retrieves the context window size (in tokens) for the specified model.

**Parameters:**

- `modelName` _(SupportedModelName)_ - The supported model name.

**Returns:**

- `number` - The context size in tokens.

---

## **License**

This project is licensed under the **MIT License**.
