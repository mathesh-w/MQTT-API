
function DebugClass(target: any) {

  const prototype = target.prototype;

  const methods = Object.getOwnPropertyNames(prototype);

  for (const methodName of methods) {

    if (methodName === 'constructor') {
        continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(
        prototype, methodName
    );

    if (!descriptor || typeof descriptor.value !== 'function') {
        continue;
    }

    const originalMethods = descriptor.value;

    descriptor.value = function (...args: any[]) {

        const start = Date.now();

        const result = originalMethods.apply(this, args);

        const end = Date.now();

       console.log(
        'Controller: ', target.name,
        '| Method called:', methodName,
        '| Arguments count:', args.length,
        '| Time taken:', end - start, 'ms'
        );

    }

    Object.defineProperty(prototype, methodName, descriptor);
    

  }
  


}

export default DebugClass;