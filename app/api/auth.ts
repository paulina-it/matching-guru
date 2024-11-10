import { UserLoginDto, UserCreateDto, LoginResponse, UserResponseDto } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function loginUser(request: UserLoginDto): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });
    console.log("Response Data:", response);

    if (!response.ok) {
        throw new Error('Failed to log in');
    }

    return response.json();
}

export async function registerUser(request: UserCreateDto): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        
        try {
            const errorData = JSON.parse(errorMessage);
            throw new Error(errorData.message || 'Failed to register');
        } catch (e) {
            throw new Error(errorMessage || 'Failed to register');
        }
    }

    return response.json();
}
