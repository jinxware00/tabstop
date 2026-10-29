from functools import wraps

def retry(times):
    if times < 1:
        raise ValueError("times must be positive")
    def decorator(fn):
        @wraps(fn)
        ⟦def wrapper(*args, **kwargs):
            last = None
            for _ in range(times):
                try:
                    return fn(*args, **kwargs)
                except Exception as error:
                    last = error
            raise last⟧

        return wrapper

    return decorator
