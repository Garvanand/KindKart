package com.kindkart.app.data.rbac

import com.kindkart.app.data.datastore.UserPreferences
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

// ===== Roles =====
enum class UserRole(val label: String) {
    USER("User"),
    SELLER("Seller"),
    ADMIN("Admin"),
}

// ===== Permissions =====
enum class Permission {
    BROWSE,
    PURCHASE,
    CREATE_KARMA,
    MANAGE_PRODUCTS,
    VIEW_ORDERS,
    MANAGE_USERS,
    MODERATE_LISTINGS,
    MODERATE_KARMA,
    ACCESS_ADMIN_PANEL,
}

// ===== Role → Permission Mapping =====
private val rolePermissions: Map<UserRole, Set<Permission>> = mapOf(
    UserRole.USER to setOf(
        Permission.BROWSE,
        Permission.PURCHASE,
        Permission.CREATE_KARMA,
    ),
    UserRole.SELLER to setOf(
        Permission.BROWSE,
        Permission.PURCHASE,
        Permission.CREATE_KARMA,
        Permission.MANAGE_PRODUCTS,
        Permission.VIEW_ORDERS,
    ),
    UserRole.ADMIN to Permission.entries.toSet(), // Admin has all permissions
)

@Singleton
class RbacManager @Inject constructor(
    private val prefs: UserPreferences,
) {
    val currentRole: Flow<UserRole> = prefs.userRole.map { roleName ->
        UserRole.entries.find { it.name == roleName } ?: UserRole.USER
    }

    fun hasPermission(role: UserRole, permission: Permission): Boolean {
        return rolePermissions[role]?.contains(permission) == true
    }

    fun getPermissions(role: UserRole): Set<Permission> {
        return rolePermissions[role] ?: emptySet()
    }
}
