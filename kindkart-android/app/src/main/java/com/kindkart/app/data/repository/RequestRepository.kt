package com.kindkart.app.data.repository

import com.kindkart.app.data.api.KindKartApi
import com.kindkart.app.data.datastore.UserPreferences
import com.kindkart.app.data.model.*
import com.kindkart.app.util.DemoData
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RequestRepository @Inject constructor(
    private val api: KindKartApi,
    private val prefs: UserPreferences
) {
    suspend fun getRequestsByCommunity(communityId: String): Result<List<HelpRequest>> {
        return try {
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            if (isGuest) return Result.success(DemoData.helpRequests)
            val response = api.getRequestsByCommunity(communityId)
            if (response.isSuccessful) Result.success(response.body() ?: emptyList())
            else Result.success(DemoData.helpRequests)
        } catch (_: Exception) {
            Result.success(DemoData.helpRequests)
        }
    }

    suspend fun getAllRequests(communityIds: List<String>): Result<List<HelpRequest>> {
        return try {
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            if (isGuest) return Result.success(DemoData.helpRequests)
            val allRequests = communityIds.flatMap { communityId ->
                try {
                    val response = api.getRequestsByCommunity(communityId)
                    if (response.isSuccessful) response.body() ?: emptyList() else emptyList()
                } catch (_: Exception) { emptyList() }
            }.sortedByDescending { it.createdAt }
            if (allRequests.isEmpty()) Result.success(DemoData.helpRequests)
            else Result.success(allRequests)
        } catch (_: Exception) {
            Result.success(DemoData.helpRequests)
        }
    }

    suspend fun getRequest(id: String): Result<HelpRequest> {
        return try {
            val response = api.getRequest(id)
            if (response.isSuccessful && response.body() != null) Result.success(response.body()!!)
            else {
                val demo = DemoData.helpRequests.find { it.id == id }
                if (demo != null) Result.success(demo)
                else Result.failure(Exception("Request not found"))
            }
        } catch (e: Exception) {
            val demo = DemoData.helpRequests.find { it.id == id }
            if (demo != null) Result.success(demo) else Result.failure(e)
        }
    }

    suspend fun createRequest(request: HelpRequestCreate): Result<HelpRequest> {
        return try {
            val response = api.createRequest(request)
            if (response.isSuccessful && response.body() != null) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to create request"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMyRequests(): Result<List<HelpRequest>> {
        return try {
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            if (isGuest) return Result.success(DemoData.helpRequests.take(3))
            val response = api.getMyRequests()
            if (response.isSuccessful) Result.success(response.body() ?: emptyList())
            else Result.success(DemoData.helpRequests.take(3))
        } catch (_: Exception) {
            Result.success(DemoData.helpRequests.take(3))
        }
    }

    suspend fun respondToRequest(requestId: String, message: String): Result<RequestResponse> {
        return try {
            val response = api.respondToRequest(requestId, mapOf("message" to message))
            if (response.isSuccessful && response.body() != null) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to respond"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
