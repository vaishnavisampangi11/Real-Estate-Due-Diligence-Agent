package com.realestate.agent.security;

import com.realestate.agent.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final User user;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.user = user;
        String roleName = user.getRole().getRoleName();
        // Convert to standard Spring Security authority format: ROLE_ROLE_NAME
        // e.g. "Real Estate Agent" -> "ROLE_REAL_ESTATE_AGENT"
        String formattedRole = "ROLE_" + roleName.toUpperCase().replace(" ", "_");
        this.authorities = List.of(new SimpleGrantedAuthority(formattedRole));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getIsActive() != null && user.getIsActive();
    }

    public Long getUserId() {
        return user.getUserId();
    }

    public User getUser() {
        return user;
    }
}
