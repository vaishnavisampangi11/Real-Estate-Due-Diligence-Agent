package com.realestate.agent.controller;

import com.realestate.agent.dto.RoleRequest;
import com.realestate.agent.dto.RoleResponse;
import com.realestate.agent.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@SecurityRequirement(name = "bearerAuth")
@Tag(
        name = "Role Management Controller",
        description = "Administrative APIs for Managing System Roles and RBAC Permissions"
)
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @Operation(summary = "Get all system roles")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/{roleId}")
    @Operation(summary = "Get role by ID")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long roleId) {
        return ResponseEntity.ok(roleService.getRoleById(roleId));
    }

    @PostMapping
    @Operation(summary = "Create a new role")
    public ResponseEntity<RoleResponse> createRole(@RequestBody RoleRequest request) {
        return new ResponseEntity<>(roleService.createRole(request), HttpStatus.CREATED);
    }

    @PutMapping("/{roleId}")
    @Operation(summary = "Update role details")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long roleId,
            @RequestBody RoleRequest request
    ) {
        return ResponseEntity.ok(roleService.updateRole(roleId, request));
    }

    @PostMapping("/{roleId}/assign/{userId}")
    @Operation(summary = "Assign a role to a user")
    public ResponseEntity<Void> assignRoleToUser(
            @PathVariable Long roleId,
            @PathVariable Long userId
    ) {
        roleService.assignRoleToUser(roleId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roleId}/users/{userId}")
    @Operation(summary = "Remove a role assignment from a user")
    public ResponseEntity<Void> removeRoleFromUser(
            @PathVariable Long roleId,
            @PathVariable Long userId
    ) {
        roleService.removeRoleFromUser(roleId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roleId}")
    @Operation(summary = "Delete role by ID")
    public ResponseEntity<Void> deleteRole(@PathVariable Long roleId) {
        roleService.deleteRole(roleId);
        return ResponseEntity.noContent().build();
    }
}
