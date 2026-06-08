# Graph Report - /home/wolfer/GIT/organoindia  (2026-06-08)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 308 nodes · 552 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e8ce677e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 18 edges
2. `Checkout` - 14 edges
3. `formatCurrency()` - 14 edges
4. `ProductListing` - 13 edges
5. `ProductDetail` - 12 edges
6. `useCart()` - 12 edges
7. `CITIES` - 9 edges
8. `Map` - 8 edges
9. `ResponseEntity` - 6 edges
10. `ExceptionHandler` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AuthBootstrap()` --calls--> `useAuthStore`  [EXTRACTED]
  ui/src/App.jsx → ui/src/store/authStore.js
- `CartPage()` --calls--> `useCart()`  [EXTRACTED]
  ui/src/features/cart/CartPage.jsx → ui/src/hooks/useCart.js
- `Checkout()` --calls--> `useCart()`  [EXTRACTED]
  ui/src/features/checkout/Checkout.jsx → ui/src/hooks/useCart.js
- `CartSummary()` --calls--> `formatCurrency()`  [EXTRACTED]
  ui/src/components/cart/CartSummary.jsx → ui/src/utils/formatters.js
- `Header()` --calls--> `useUiStore`  [EXTRACTED]
  ui/src/components/layout/Header.jsx → ui/src/store/uiStore.js

## Import Cycles
- None detected.

## Communities (22 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (19): emptyProduct, usersApi, addressSchema, Checkout(), steps, Home(), defaultFilters, ProductListing() (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (19): authApi, api, cartApi, AdminRoute(), Login(), schema, useAuth(), cartQueryKey (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (36): dependencies, axios, date-fns, @emotion/react, @emotion/styled, eslint, @eslint/js, eslint-plugin-react-hooks (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (8): AdminDashboard(), CartPage(), CartSummary(), OrderCard(), colors, OrderDetail(), formatCurrency(), formatDate()

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (14): colors, Addresses, AdminUsers, AuthBootstrap(), CartPage, Home, Login, OrdersList (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (17): AccessDeniedException, AccessDeniedHandler, AuthenticationConfiguration, AuthenticationEntryPoint, AuthenticationException, AuthenticationManager, Bean, SecurityConfig (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (13): UserRepository, AuthService, Optional, String, User, Override, String, UserDetails (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.19
Nodes (12): FilterChain, GrantedAuthority, List, OncePerRequestFilter, SecretKey, JwtFilter, JwtUtil, HttpServletRequest (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.21
Nodes (7): Optional, RefreshToken, String, User, RefreshToken, String, Transactional

### Community 9 - "Community 9"
Cohesion: 0.34
Nodes (10): BadCredentialsException, DisabledException, ExceptionHandler, IllegalArgumentException, IllegalStateException, Map, MethodArgumentNotValidException, Object (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.31
Nodes (4): schema, PostMapping, ResponseEntity, Void

### Community 11 - "Community 11"
Cohesion: 0.28
Nodes (5): ApplicationArguments, ApplicationRunner, Override, String, Test

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (8): editor.linkedEditing, java.compile.nullAnalysis.mode, java.configuration.runtimes, java.configuration.updateBuildConfiguration, java.import.gradle.enabled, java.import.gradle.home, java.import.gradle.java.home, java.jdt.ls.java.home

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): Long, PreAuthorize, ProductService

## Knowledge Gaps
- **80 isolated node(s):** `editor.linkedEditing`, `java.jdt.ls.java.home`, `java.configuration.runtimes`, `java.import.gradle.enabled`, `java.import.gradle.home` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PasswordEncoder` connect `Community 5` to `Community 11`, `Community 6`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `Map` connect `Community 9` to `Community 5`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `editor.linkedEditing`, `java.jdt.ls.java.home`, `java.configuration.runtimes` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08858858858858859 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11861861861861862 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.13846153846153847 - nodes in this community are weakly interconnected._