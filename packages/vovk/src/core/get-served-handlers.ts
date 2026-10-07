import type { VovkController, VovkControllerInternal } from '../types/core.js';

// what a controller class holds itself, not what it reads from the class it extends
export const getOwn = <TKey extends keyof VovkControllerInternal>(controller: VovkController, key: TKey) =>
  Object.hasOwn(controller, key) ? controller[key] : undefined;

// a controller serves its own routes, cloned ones included, and those of the class it extends while that class is in
// the segment too; the farthest class comes first, so a nearer one overrides it
export function getServingClasses(controller: VovkController, controllers: ReadonlySet<VovkController>) {
  const classes = [controller];
  for (
    let parent = Object.getPrototypeOf(controller);
    controllers.has(parent);
    parent = Object.getPrototypeOf(parent)
  ) {
    classes.unshift(parent);
  }
  return classes;
}

// the handlers of a controller that its segment serves, which its schema lists
export function getServedHandlers(controller: VovkController, controllers: ReadonlySet<VovkController>) {
  const classes = getServingClasses(controller, controllers);
  const handlers: VovkControllerInternal['_handlers'] = Object.assign(
    {},
    ...classes.map((servingClass) => getOwn(servingClass, '_handlers'))
  );
  const handlersMetadata: NonNullable<VovkControllerInternal['_handlersMetadata']> = Object.assign(
    {},
    ...classes.map((servingClass) => getOwn(servingClass, '_handlersMetadata'))
  );
  return { handlers, handlersMetadata };
}
