def debug_middleware(get_response):
    def middleware(request):
        print("Headers received in Django:")
        print(request.headers)  # Prints all headers
        print("Authorization Header:", request.headers.get("Authorization"))  # Prints only the Authorization header
        
        response = get_response(request)
        return response

    return middleware
