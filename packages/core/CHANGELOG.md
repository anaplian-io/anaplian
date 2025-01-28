# [@anaplian/core-v1.13.1](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.13.0...@anaplian/core-v1.13.1) (2025-01-28)


### Bug Fixes

* **core:** added a context provider that adds static images to the context and fixed serializer ([#84](https://github.com/anaplian-io/anaplian/issues/84)) ([0de3abc](https://github.com/anaplian-io/anaplian/commit/0de3abc583dad7aed3dc44adb9767f511e1ea326))

# [@anaplian/core-v1.13.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.12.3...@anaplian/core-v1.13.0) (2025-01-26)


### Features

* **core:** experimental API for supporting image inputs in context providers ([#77](https://github.com/anaplian-io/anaplian/issues/77)) ([1d96a24](https://github.com/anaplian-io/anaplian/commit/1d96a2481b9abfabc428dfb41de7e7c11bca2810))

# [@anaplian/core-v1.12.3](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.12.2...@anaplian/core-v1.12.3) (2025-01-20)


### Bug Fixes

* **core:** ensure that the immediate is cleared up ([7cf7ef5](https://github.com/anaplian-io/anaplian/commit/7cf7ef5d4257987c1b68e829c5c99202da363046))

# [@anaplian/core-v1.12.2](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.12.1...@anaplian/core-v1.12.2) (2025-01-14)


### Bug Fixes

* **core:** fixed an issue where addAction would not accept actions with multiple args ([729bbbe](https://github.com/anaplian-io/anaplian/commit/729bbbeee8ae980d749c2640d3414580f8d1d5ad))
* **core:** help with tree shaking by setting sideEffects to false ([35cd45c](https://github.com/anaplian-io/anaplian/commit/35cd45cb06992e5403759a263e3c4f189bf40a32))
* **core:** improved type hints to indicate how actions should be created ([54f7c66](https://github.com/anaplian-io/anaplian/commit/54f7c6640d1f82e7539d1cbd8d6fe47bdc03ad53))

# [@anaplian/core-v1.12.1](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.12.0...@anaplian/core-v1.12.1) (2025-01-10)


### Bug Fixes

* **core:** call context refresh prior to invoking the model ([3e58d41](https://github.com/anaplian-io/anaplian/commit/3e58d411d1127a7ef3210e1c21caabe6781604b9))

# [@anaplian/core-v1.12.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.11.0...@anaplian/core-v1.12.0) (2025-01-09)


### Features

* **core:** allow context providers to optionally perform a context refresh ([e79a78b](https://github.com/anaplian-io/anaplian/commit/e79a78b5dfdecc4fe9264b79e52ae6ba3c8c14a7))

# [@anaplian/core-v1.11.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.10.0...@anaplian/core-v1.11.0) (2025-01-09)


### Features

* **core:** firmed up type-checking for Actions ([a238552](https://github.com/anaplian-io/anaplian/commit/a238552d59d4621a4bc35fd30bfe8dbd8f02b5bf))

# [@anaplian/core-v1.10.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.9.2...@anaplian/core-v1.10.0) (2025-01-07)


### Features

* **core:** initial runtime release ([fddfea7](https://github.com/anaplian-io/anaplian/commit/fddfea7d5384982ee2ac1c34db1be487cdcde123))

# [@anaplian/core-v1.9.2](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.9.1...@anaplian/core-v1.9.2) (2025-01-07)


### Bug Fixes

* **core:** fatalError event is now executed prior to shut down ([5696c8b](https://github.com/anaplian-io/anaplian/commit/5696c8b0841107d10ddd0f1c6fc76eca1598d7cd))

# [@anaplian/core-v1.9.1](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.9.0...@anaplian/core-v1.9.1) (2025-01-07)


### Bug Fixes

* **core:** moved types exports as this was causing a warning for the bundler ([481d94a](https://github.com/anaplian-io/anaplian/commit/481d94a7973aa97c3729bd1441ff2477c9b11d4d))

# [@anaplian/core-v1.9.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.8.0...@anaplian/core-v1.9.0) (2025-01-06)


### Features

* **core:** implemented the history context provider ([14fc48f](https://github.com/anaplian-io/anaplian/commit/14fc48f119b3ffaa55c4ffcdb399b70ba5fe1819))

# [@anaplian/core-v1.8.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.7.0...@anaplian/core-v1.8.0) (2025-01-05)


### Features

* **core:** implement the "think" action ([261f621](https://github.com/anaplian-io/anaplian/commit/261f621c62ea7854a0ecf3cfb04b38089e266afe))

# [@anaplian/core-v1.7.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.6.0...@anaplian/core-v1.7.0) (2025-01-05)


### Features

* **core:** implement the the date context provider ([fc1978a](https://github.com/anaplian-io/anaplian/commit/fc1978a25e179e7c8d5554594beda15b3e38415a))

# [@anaplian/core-v1.6.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.5.0...@anaplian/core-v1.6.0) (2025-01-05)


### Bug Fixes

* **core:** disambiguate how to pass quotation marks and new lines into actions ([7c22aa3](https://github.com/anaplian-io/anaplian/commit/7c22aa3b4c22da7dff4fc8a7ae557bfbfe79f01f))


### Features

* **core:** implement the nop action ([2457b75](https://github.com/anaplian-io/anaplian/commit/2457b751db7672bfdf1e2004a3ffb4ce28e0136d))

# [@anaplian/core-v1.5.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.4.0...@anaplian/core-v1.5.0) (2025-01-03)


### Features

* **core:** enhanced error handling for context providers ([b70be7c](https://github.com/anaplian-io/anaplian/commit/b70be7cba088a6f07e096e70eb58826a48464c7f))

# [@anaplian/core-v1.4.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.3.1...@anaplian/core-v1.4.0) (2025-01-03)


### Bug Fixes

* **core:** refactor types in preparation for making agent builder ([8c9110a](https://github.com/anaplian-io/anaplian/commit/8c9110a77ccd6e8d73349613a1429886e988befe))
* **core:** removed __tests__ directories from build artifact ([08e2cc9](https://github.com/anaplian-io/anaplian/commit/08e2cc9be8382e7697e0852ce0cdbffa08d9ffd5))


### Features

* **core:** built agent builder for constructing new agents ([c9a50be](https://github.com/anaplian-io/anaplian/commit/c9a50be9bbb87f2fae99a1f383cb24dce215cef9))
* **core:** finished building and testing the agent builder ([ffe3f16](https://github.com/anaplian-io/anaplian/commit/ffe3f160117ca4849697309802a53f30b73d6838))

# [@anaplian/core-v1.3.1](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.3.0...@anaplian/core-v1.3.1) (2025-01-02)


### Bug Fixes

* **core:** adjust exports and types to make exporting package work correctly ([dedbc15](https://github.com/anaplian-io/anaplian/commit/dedbc1570ea3c8e0173305f882ffdd23adf6ad2f))

# [@anaplian/core-v1.3.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.2.1...@anaplian/core-v1.3.0) (2025-01-02)


### Features

* added a small package for indexing context window sizes ([a769057](https://github.com/anaplian-io/anaplian/commit/a769057e31577cbebf5e9233d69eaceb1c848268))

# [@anaplian/core-v1.2.1](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.2.0...@anaplian/core-v1.2.1) (2024-12-31)


### Bug Fixes

* **core:** the agent loop now yields control to the event loop after each iteration ([3bfc297](https://github.com/anaplian-io/anaplian/commit/3bfc2978d76fb59f7ed1152e75bb1d18f316f309))

# [@anaplian/core-v1.2.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.1.0...@anaplian/core-v1.2.0) (2024-12-31)


### Features

* built agent orchestrator ([76a345b](https://github.com/anaplian-io/anaplian/commit/76a345b7e9f8a20da3f72a95128c9c57811fe7ee))

# [@anaplian/core-v1.1.0](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.0.3...@anaplian/core-v1.1.0) (2024-12-30)


### Features

* implemented action handler and validator ([4cd9801](https://github.com/anaplian-io/anaplian/commit/4cd9801bcffdfdb6690e1e1b80ea28ae8f4456b3))
* implemented context creator and its associated interfaces ([6c1922d](https://github.com/anaplian-io/anaplian/commit/6c1922d473dc7fe78ac5120c12d2a821ca38275a))

# [@anaplian/core-v1.0.3](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.0.2...@anaplian/core-v1.0.3) (2024-12-28)


### Bug Fixes

* dummy sync to get github and npm on the same versioning ([3f7d7c1](https://github.com/anaplian-io/anaplian/commit/3f7d7c1a2f7c6ae480b7f53f53bbbe3559c24347))

# [@anaplian/core-v1.0.2](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.0.1...@anaplian/core-v1.0.2) (2024-12-28)


### Bug Fixes

* dummy sync to get github and npm on the same versioning ([e40efd1](https://github.com/anaplian-io/anaplian/commit/e40efd1b2383431c8b1f75719f5cd6716e651538))

# [@anaplian/core-v1.0.1](https://github.com/anaplian-io/anaplian/compare/@anaplian/core-v1.0.0...@anaplian/core-v1.0.1) (2024-12-28)


### Bug Fixes

* dummy sync to get github and npm on the same versioning ([1775aee](https://github.com/anaplian-io/anaplian/commit/1775aee6b6c94ff8ba4da1b67b9b9f8b750b4e91))

# @anaplian/core-v1.0.0 (2024-12-28)


### Bug Fixes

* move .releaserc.json into core workspace ([52f3ba4](https://github.com/anaplian-io/anaplian/commit/52f3ba42d18bad4051274b7637f1dcfa2be80831))
* **root:** allow semantic-release to update package.json ([2939195](https://github.com/anaplian-io/anaplian/commit/2939195a1c959a7560e1ec0b99ce0a81190de145))
* run correct command for semantic-release ([7c59fa5](https://github.com/anaplian-io/anaplian/commit/7c59fa5b5d2c8ad5578a3ea5bf9aad9bfb80de98))


### Features

* initial commit ([#8](https://github.com/anaplian-io/anaplian/issues/8)) ([3819b97](https://github.com/anaplian-io/anaplian/commit/3819b97f668615b241389854edaa653e0adaa97f))
* initial package and monorepo bootstrapping ([#2](https://github.com/anaplian-io/anaplian/issues/2)) ([bbfe773](https://github.com/anaplian-io/anaplian/commit/bbfe77324a56272985068a15943ba53c576ff246))
