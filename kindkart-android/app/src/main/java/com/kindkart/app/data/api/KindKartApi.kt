package com.kindkart.app.data.api

import com.kindkart.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface KindKartApi {

    // ===== Auth =====
    @POST("api/auth/send-otp")
    suspend fun sendOtp(@Body request: OtpRequest): Response<Map<String, Any>>

    @POST("api/auth/verify-otp")
    suspend fun verifyOtp(@Body request: OtpVerifyRequest): Response<AuthResponse>

    @POST("api/auth/refresh-token")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<AuthResponse>

    @POST("api/auth/guest-login")
    suspend fun guestLogin(): Response<AuthResponse>

    @POST("api/auth/logout")
    suspend fun logout(): Response<Map<String, Any>>

    // ===== Users =====
    @GET("api/users/profile")
    suspend fun getProfile(): Response<User>

    @PUT("api/users/profile")
    suspend fun updateProfile(@Body request: ProfileUpdateRequest): Response<ProfileUpdateResponse>

    @POST("api/users/upload-photo")
    suspend fun uploadPhoto(@Body body: Map<String, String>): Response<Map<String, Any>>

    @GET("api/users/communities")
    suspend fun getUserCommunities(): Response<List<CommunityMembership>>

    // ===== Communities =====
    @POST("api/communities/create")
    suspend fun createCommunity(@Body request: CommunityCreateRequest): Response<Community>

    @POST("api/communities/join")
    suspend fun joinCommunity(@Body request: CommunityJoinRequest): Response<Map<String, Any>>

    @GET("api/communities/{id}")
    suspend fun getCommunity(@Path("id") id: String): Response<Community>

    @GET("api/communities/{id}/members")
    suspend fun getCommunityMembers(@Path("id") id: String): Response<List<CommunityMember>>

    @POST("api/communities/{id}/approve-member")
    suspend fun approveMember(
        @Path("id") communityId: String,
        @Body body: Map<String, String>
    ): Response<Map<String, Any>>

    // ===== Help Requests =====
    @POST("api/requests/create")
    suspend fun createRequest(@Body request: HelpRequestCreate): Response<HelpRequest>

    @GET("api/requests/community/{communityId}")
    suspend fun getRequestsByCommunity(@Path("communityId") communityId: String): Response<List<HelpRequest>>

    @GET("api/requests/{id}")
    suspend fun getRequest(@Path("id") id: String): Response<HelpRequest>

    @POST("api/requests/{id}/respond")
    suspend fun respondToRequest(
        @Path("id") requestId: String,
        @Body body: Map<String, String>
    ): Response<RequestResponse>

    @POST("api/requests/{id}/accept-response")
    suspend fun acceptResponse(
        @Path("id") requestId: String,
        @Body body: Map<String, String>
    ): Response<Map<String, Any>>

    @PUT("api/requests/{id}/status")
    suspend fun updateRequestStatus(
        @Path("id") requestId: String,
        @Body body: Map<String, String>
    ): Response<Map<String, Any>>

    @GET("api/requests/my-requests")
    suspend fun getMyRequests(): Response<List<HelpRequest>>

    @GET("api/requests/my-responses")
    suspend fun getMyResponses(): Response<List<RequestResponse>>

    // ===== Messages =====
    @GET("api/messages/request/{requestId}")
    suspend fun getMessagesByRequest(@Path("requestId") requestId: String): Response<List<Message>>

    @POST("api/messages/send")
    suspend fun sendMessage(@Body request: SendMessageRequest): Response<Message>

    @GET("api/messages/conversations")
    suspend fun getConversations(): Response<List<Conversation>>

    // ===== Payments =====
    @POST("api/payments/create-order")
    suspend fun createPaymentOrder(@Body request: PaymentOrderRequest): Response<Map<String, Any>>

    @POST("api/payments/verify")
    suspend fun verifyPayment(@Body body: Map<String, String>): Response<Map<String, Any>>

    @GET("api/payments/wallet/{userId}")
    suspend fun getWallet(@Path("userId") userId: String): Response<WalletInfo>

    @GET("api/payments/transactions")
    suspend fun getTransactions(): Response<List<Transaction>>

    @POST("api/payments/release/{transactionId}")
    suspend fun releasePayment(@Path("transactionId") transactionId: String): Response<Map<String, Any>>

    // ===== Reputation =====
    @GET("api/reputation/user/{userId}")
    suspend fun getUserReputation(@Path("userId") userId: String): Response<ReputationInfo>

    @GET("api/reputation/user/{userId}/badges")
    suspend fun getUserBadges(@Path("userId") userId: String): Response<List<Badge>>

    @GET("api/reputation/user/{userId}/achievements")
    suspend fun getUserAchievements(@Path("userId") userId: String): Response<List<Badge>>

    @GET("api/reputation/leaderboard")
    suspend fun getLeaderboard(
        @Query("type") type: String = "overall",
        @Query("communityId") communityId: String? = null,
        @Query("timeRange") timeRange: String? = null,
        @Query("limit") limit: Int? = null
    ): Response<List<LeaderboardEntry>>

    // ===== Notifications =====
    @GET("api/notifications")
    suspend fun getNotifications(): Response<List<Notification>>

    @GET("api/notifications/unread-count")
    suspend fun getUnreadCount(): Response<Map<String, Int>>

    @PUT("api/notifications/{id}/read")
    suspend fun markRead(@Path("id") id: String): Response<Map<String, Any>>

    @PUT("api/notifications/read-all")
    suspend fun markAllRead(): Response<Map<String, Any>>

    // ===== Emergency =====
    @POST("api/emergency/create")
    suspend fun createEmergencyAlert(@Body body: Map<String, String>): Response<EmergencyAlert>

    @GET("api/emergency/community/{communityId}")
    suspend fun getEmergencyAlerts(@Path("communityId") communityId: String): Response<List<EmergencyAlert>>

    @POST("api/emergency/{id}/resolve")
    suspend fun resolveAlert(@Path("id") id: String): Response<Map<String, Any>>

    // ===== Tasks =====
    @POST("api/tasks/create")
    suspend fun createTask(@Body body: Map<String, Any>): Response<CommunityTask>

    @GET("api/tasks/community/{communityId}")
    suspend fun getTasksByCommunity(@Path("communityId") communityId: String): Response<List<CommunityTask>>

    // ===== Extended =====
    @GET("api/ext/events/{communityId}")
    suspend fun getCommunityEvents(@Path("communityId") communityId: String): Response<List<CommunityEvent>>

    @GET("api/ext/search")
    suspend fun globalSearch(@Query("q") query: String): Response<Map<String, Any>>

    // ===== Health =====
    @GET("health")
    suspend fun healthCheck(): Response<Map<String, Any>>
}
