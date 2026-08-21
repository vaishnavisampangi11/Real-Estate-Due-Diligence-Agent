package com.realestate.agent.service;

import com.realestate.agent.dto.RoleRequest;
import com.realestate.agent.dto.RoleResponse;

import java.util.List;

public interface RoleService {

    List<RoleResponse> getAllRoles();

    RoleResponse getRoleById(Long roleId);

    RoleResponse createRole(RoleRequest request);

    RoleResponse updateRole(Long roleId, RoleRequest request);

    void assignRoleToUser(Long roleId, Long userId);

    void removeRoleFromUser(Long roleId, Long userId);

    void deleteRole(Long roleId);
}
