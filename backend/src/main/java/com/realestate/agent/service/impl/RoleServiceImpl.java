package com.realestate.agent.service.impl;

import com.realestate.agent.dto.RoleRequest;
import com.realestate.agent.dto.RoleResponse;
import com.realestate.agent.entity.Role;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceAlreadyExistsException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.repository.RoleRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.RoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    private static final Map<String, List<String>> DEFAULT_PERMISSIONS = new HashMap<>();
    private static final Map<String, List<String>> AVAILABLE_PERMISSIONS = new HashMap<>();

    static {
        DEFAULT_PERMISSIONS.put("ADMINISTRATOR", List.of(
                "ALL_SYSTEM_ACCESS", "USER_MANAGEMENT_WRITE", "ROLE_PERMISSION_MANAGE",
                "AUDIT_LOG_READ_WRITE", "TELEMETRY_EXPORT", "SECURITY_POLICY_OVERRIDE"
        ));
        AVAILABLE_PERMISSIONS.put("ADMINISTRATOR", List.of(
                "ALL_SYSTEM_ACCESS", "USER_MANAGEMENT_WRITE", "ROLE_PERMISSION_MANAGE",
                "AUDIT_LOG_READ_WRITE", "TELEMETRY_EXPORT", "SECURITY_POLICY_OVERRIDE",
                "DATABASE_SNAPSHOT_BACKUP", "SUB_REGISTRAR_API_SYNC"
        ));

        DEFAULT_PERMISSIONS.put("BUYER", List.of(
                "PROPERTY_SEARCH_READ", "TITLE_REPORT_VIEW", "WATCHLIST_MANAGE",
                "REQUEST_LEGAL_REVIEW", "DOWNLOAD_AUDIT_PDF"
        ));
        AVAILABLE_PERMISSIONS.put("BUYER", List.of(
                "PROPERTY_SEARCH_READ", "TITLE_REPORT_VIEW", "WATCHLIST_MANAGE",
                "REQUEST_LEGAL_REVIEW", "DOWNLOAD_AUDIT_PDF", "PROPERTY_VALUATION_CALCULATOR",
                "INVESTMENT_YIELD_SIMULATOR"
        ));

        DEFAULT_PERMISSIONS.put("REAL_ESTATE_AGENT", List.of(
                "PROPERTY_LISTING_CREATE", "CLIENT_LEAD_MANAGE", "SURVEY_DEED_UPLOAD",
                "SITE_VISIT_SCHEDULE", "COMPARABLE_PROPERTIES_READ"
        ));
        AVAILABLE_PERMISSIONS.put("REAL_ESTATE_AGENT", List.of(
                "PROPERTY_LISTING_CREATE", "CLIENT_LEAD_MANAGE", "SURVEY_DEED_UPLOAD",
                "SITE_VISIT_SCHEDULE", "COMPARABLE_PROPERTIES_READ", "BULK_PARCEL_IMPORT",
                "DEED_CHAIN_BUILDER"
        ));

        DEFAULT_PERMISSIONS.put("LEGAL_REVIEWER", List.of(
                "ENCUMBRANCE_DEED_AUDIT", "LEGAL_CERTIFICATE_ISSUE", "LITIGATION_SEARCH_READ",
                "TITLE_CHAIN_VERIFY", "MUNICIPAL_TAX_LEDGER_CHECK"
        ));
        AVAILABLE_PERMISSIONS.put("LEGAL_REVIEWER", List.of(
                "ENCUMBRANCE_DEED_AUDIT", "LEGAL_CERTIFICATE_ISSUE", "LITIGATION_SEARCH_READ",
                "TITLE_CHAIN_VERIFY", "MUNICIPAL_TAX_LEDGER_CHECK", "COURT_STAY_ORDER_FLAG",
                "DIGITAL_SEAL_CERTIFICATION"
        ));

        DEFAULT_PERMISSIONS.put("FINANCIAL_INSTITUTION", List.of(
                "COLLATERAL_VALUATION_READ", "RISK_SCORE_ASSESSMENT", "LOAN_APPLICATION_REVIEW",
                "TAX_CLEARANCE_VERIFY", "UNDERWRITING_REPORT_GENERATE"
        ));
        AVAILABLE_PERMISSIONS.put("FINANCIAL_INSTITUTION", List.of(
                "COLLATERAL_VALUATION_READ", "RISK_SCORE_ASSESSMENT", "LOAN_APPLICATION_REVIEW",
                "TAX_CLEARANCE_VERIFY", "UNDERWRITING_REPORT_GENERATE", "DSCR_SIMULATOR_WRITE",
                "PORTFOLIO_EXPOSURE_ANALYTICS"
        ));
    }

    public RoleServiceImpl(RoleRepository roleRepository, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        List<User> users = userRepository.findAll();

        return roles.stream()
                .map(role -> mapToRoleResponse(role, users))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        List<User> users = userRepository.findAll();
        return mapToRoleResponse(role, users);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.findByRoleName(request.getRoleName()).isPresent()) {
            throw new ResourceAlreadyExistsException("Role already exists with name: " + request.getRoleName());
        }

        Role role = Role.builder()
                .roleName(request.getRoleName().toUpperCase())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Role saved = roleRepository.save(role);
        return mapToRoleResponse(saved, Collections.emptyList());
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long roleId, RoleRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        if (StringUtils.hasText(request.getRoleName())) {
            role.setRoleName(request.getRoleName().toUpperCase());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getIsActive() != null) {
            role.setIsActive(request.getIsActive());
        }

        Role saved = roleRepository.save(role);
        List<User> users = userRepository.findAll();
        return mapToRoleResponse(saved, users);
    }

    @Override
    @Transactional
    public void assignRoleToUser(Long roleId, Long userId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setRole(role);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeRoleFromUser(Long roleId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Role buyerRole = roleRepository.findByRoleName("BUYER")
                .orElseGet(() -> roleRepository.save(Role.builder().roleName("BUYER").isActive(true).build()));

        user.setRole(buyerRole);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        roleRepository.delete(role);
    }

    private RoleResponse mapToRoleResponse(Role role, List<User> allUsers) {
        String rName = role.getRoleName() != null ? role.getRoleName().toUpperCase() : "BUYER";

        long userCount = allUsers.stream()
                .filter(u -> u.getRole() != null &&
                        (u.getRole().getRoleId().equals(role.getRoleId()) ||
                         u.getRole().getRoleName().equalsIgnoreCase(role.getRoleName())))
                .count();

        long activeCount = allUsers.stream()
                .filter(u -> u.getRole() != null &&
                        (u.getRole().getRoleId().equals(role.getRoleId()) ||
                         u.getRole().getRoleName().equalsIgnoreCase(role.getRoleName())) &&
                        Boolean.TRUE.equals(u.getIsActive()))
                .count();

        List<String> perms = DEFAULT_PERMISSIONS.getOrDefault(rName, List.of("DUE_DILIGENCE_PORTAL_ACCESS", "RECORD_SEARCH_READ"));
        List<String> availPerms = AVAILABLE_PERMISSIONS.getOrDefault(rName, perms);

        String desc = role.getDescription();
        if (!StringUtils.hasText(desc)) {
            if ("ADMINISTRATOR".equals(rName)) {
                desc = "Full platform command access, user management, global security configurations, system telemetry, and audit log overrides.";
            } else if ("BUYER".equals(rName)) {
                desc = "Search property records, inspect due diligence title reports, save watchlists, and request legal encumbrance reviews.";
            } else if ("REAL_ESTATE_AGENT".equals(rName)) {
                desc = "List property parcels, upload land survey deeds, manage buyer leads, schedule site inspections, and track client inquiries.";
            } else if ("LEGAL_REVIEWER".equals(rName)) {
                desc = "Execute 30-year Sub-Registrar encumbrance searches, issue legal title verification certificates, and audit litigation records.";
            } else if ("FINANCIAL_INSTITUTION".equals(rName)) {
                desc = "Assess collateral risk scores, verify municipal tax clearance, review mortgage loan requests, and generate underwriting reports.";
            } else {
                desc = "System configured access permissions and workflow controls.";
            }
        }

        return RoleResponse.builder()
                .roleId(role.getRoleId())
                .roleName(rName)
                .description(desc)
                .isActive(role.getIsActive() != null ? role.getIsActive() : true)
                .userCount(userCount)
                .activeUserCount(activeCount)
                .permissions(perms)
                .availablePermissions(availPerms)
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}
