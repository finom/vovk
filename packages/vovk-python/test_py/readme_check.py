"""Checks the README samples of a generated package against the methods they call."""
import ast
import inspect
import io
import re
import sys
import types
import typing
from typing import Any, Dict, List

if sys.version_info >= (3, 11):
    from typing import NotRequired, Required, is_typeddict
else:
    from typing_extensions import NotRequired, Required, is_typeddict

# the placeholders the samples leave to the reader
NAMESPACE = {'binary_data': b'binary data', 'BytesIO': io.BytesIO}


def fits(value: Any, hint: Any, localns: Dict[str, Any]) -> bool:
    """Whether a value has the type a hint names, as mypy reads a literal of it."""
    origin = typing.get_origin(hint)
    args = typing.get_args(hint)
    if hint is Any:
        return True
    if hint is None or hint is type(None):
        return value is None
    if origin in (NotRequired, Required):
        return fits(value, args[0], localns)
    if origin is typing.Union or origin is getattr(types, 'UnionType', typing.Union):
        return any(fits(value, arg, localns) for arg in args)
    if origin is typing.Literal:
        return value in args
    if hint is typing.BinaryIO:
        return callable(getattr(value, 'read', None))
    if is_typeddict(hint):
        if not isinstance(value, dict):
            return False
        hints = typing.get_type_hints(hint, localns=localns, include_extras=True)
        markers = {key: typing.get_origin(key_hint) for key, key_hint in hints.items()}
        required = {key for key, marker in markers.items() if marker is Required or (hint.__total__ and marker is not NotRequired)}
        return required <= value.keys() <= hints.keys() and all(fits(value[key], hints[key], localns) for key in value)
    if origin is list:
        return isinstance(value, list) and (not args or all(fits(item, args[0], localns) for item in value))
    if origin is dict:
        return isinstance(value, dict) and (
            not args or all(fits(k, args[0], localns) and fits(v, args[1], localns) for k, v in value.items())
        )
    if origin is tuple:
        if not isinstance(value, tuple):
            return False
        if len(args) == 2 and args[1] is Ellipsis:
            return all(fits(item, args[0], localns) for item in value)
        return len(value) == len(args) and all(fits(item, arg, localns) for item, arg in zip(value, args))
    if hint is float:
        return isinstance(value, (int, float))
    if isinstance(hint, type):
        return isinstance(value, hint)
    return True


def check_readme(readme: str, package: types.ModuleType) -> List[str]:
    """What is wrong with each sample: it doesn't parse, or it calls its method with an argument it doesn't take, without
    one it needs, or with a value of another type."""
    samples = re.findall(r'^### (\S+)$.*?^```py\n(.*?)^```$', readme, re.S | re.M)
    if not samples:
        return ['no samples']
    problems: List[str] = []
    for heading, source in samples:
        try:
            tree = ast.parse(source, heading)
        except SyntaxError as error:
            problems.append(f'{heading}: {error.msg}: {error.text!r}')
            continue
        rpc_name, method_name = heading.split('.')
        calls = [
            node
            for node in ast.walk(tree)
            if isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == rpc_name
            and node.func.attr == method_name
        ]
        if len(calls) != 1 or calls[0].args:
            problems.append(f'{heading}: no call of {heading} with keyword arguments')
            continue
        rpc = getattr(package, rpc_name)
        method = getattr(rpc, method_name)
        kwargs = {
            str(keyword.arg): eval(compile(ast.Expression(keyword.value), heading, 'eval'), dict(NAMESPACE))
            for keyword in calls[0].keywords
        }
        try:
            inspect.signature(method).bind(**kwargs)
        except TypeError as error:
            problems.append(f'{heading}: {error}')
            continue
        localns = dict(vars(rpc))
        hints = typing.get_type_hints(method, localns=localns)
        problems.extend(
            f'{heading}: {name}={value!r} is not a {hints[name]}'
            for name, value in kwargs.items()
            if not fits(value, hints[name], localns)
        )
    return problems
