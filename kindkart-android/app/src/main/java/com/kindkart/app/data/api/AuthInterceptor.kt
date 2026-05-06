package com.kindkart.app.data.api

import com.kindkart.app.data.datastore.UserPreferences
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val userPreferences: UserPreferences
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // Don't add auth header for auth endpoints
        if (originalRequest.url.encodedPath.contains("/api/auth/")) {
            return chain.proceed(originalRequest)
        }

        val token = runBlocking {
            userPreferences.accessToken.firstOrNull()
        }

        val request = if (!token.isNullOrEmpty()) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .header("Content-Type", "application/json")
                .build()
        } else {
            originalRequest.newBuilder()
                .header("Content-Type", "application/json")
                .build()
        }

        return chain.proceed(request)
    }
}
