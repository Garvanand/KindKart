package com.kindkart.app.data.repository

import com.kindkart.app.data.api.KindKartApi
import com.kindkart.app.data.datastore.UserPreferences
import com.kindkart.app.data.model.*
import com.kindkart.app.util.DemoData
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CommunityRepository @Inject constructor(
    private val api: KindKartApi,
    private val prefs: UserPreferences
) {
    suspend fun getUserCommunities(): Result<List<CommunityMembership>> {
        return try {
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            if (isGuest) return Result.success(DemoData.communities)
            val response = api.getUserCommunities()
            if (response.isSuccessful) Result.success(response.body() ?: emptyList())
            else Result.success(DemoData.communities)
        } catch (e: Exception) {
            Result.success(DemoData.communities)
        }
    }

    suspend fun getCommunity(id: String): Result<Community> {
        return try {
            val response = api.getCommunity(id)
            if (response.isSuccessful && response.body() != null) Result.success(response.body()!!)
            else Result.failure(Exception("Community not found"))
        } catch (e: Exception) {
            // Fallback to demo
            val demo = DemoData.communities.find { it.community.id == id }?.community
            if (demo != null) Result.success(demo) else Result.failure(e)
        }
    }

    suspend fun createCommunity(name: String, rules: String?): Result<Community> {
        return try {
            val response = api.createCommunity(CommunityCreateRequest(name, rules))
            if (response.isSuccessful && response.body() != null) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to create community"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun joinCommunity(inviteCode: String): Result<Map<String, Any>> {
        return try {
            val response = api.joinCommunity(CommunityJoinRequest(inviteCode))
            if (response.isSuccessful) Result.success(response.body() ?: emptyMap())
            else Result.failure(Exception("Failed to join community"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCommunityMembers(id: String): Result<List<CommunityMember>> {
        return try {
            val response = api.getCommunityMembers(id)
            if (response.isSuccessful) Result.success(response.body() ?: emptyList())
            else Result.success(emptyList())
        } catch (_: Exception) {
            Result.success(emptyList())
        }
    }
}
