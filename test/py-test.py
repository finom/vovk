from python import NoValidationControllerServiceAndWorkerEntityRPC
from jsonschema.exceptions import ValidationError
import requests

def main():
    base_url = "http://localhost:3000/api"

    try:
        # Notice we're NOT doing: client = NoValidationControllerServiceAndWorkerEntityRPC(base_url)
        # We directly call the class method, passing the base_url.
        response = NoValidationControllerServiceAndWorkerEntityRPC.getNoValidationControllerServiceAndWorkerEntities(
            base_url,
            query={},
            body={}
        )
        data = response.json()
        print("Response data:", data)

    except ValidationError as ve:
        print("Validation error:", ve.message)
    except requests.HTTPError as he:
        print("HTTP error:", he)

if __name__ == "__main__":
    main()
