document.addEventListener('DOMContentLoaded', function() {
  // ========== 侧边栏控制 ==========
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  
  function openSidebar() {
    sidebar?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  
  function closeSidebarMenu() {
    sidebar?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  sidebarToggle?.addEventListener('click', openSidebar);
  closeSidebar?.addEventListener('click', closeSidebarMenu);
  mobileOverlay?.addEventListener('click', closeSidebarMenu);
  
  // ========== 复制链接功能 ==========
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const url = this.getAttribute('data-url');
      if (!url) return;
      
      navigator.clipboard.writeText(url).then(() => {
        showCopySuccess(this);
      }).catch(() => {
        // 备用方法
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showCopySuccess(this);
        } catch (e) {
          alert('复制失败,请手动复制');
        }
        document.body.removeChild(textarea);
      });
    });
  });
  
  function showCopySuccess(btn) {
    const successMsg = btn.querySelector('.copy-success');
    successMsg.classList.remove('hidden');
    successMsg.classList.add('copy-success-animation');
    setTimeout(() => {
      successMsg.classList.add('hidden');
      successMsg.classList.remove('copy-success-animation');
    }, 2000);
  }
  
  // ========== 返回顶部 ==========
  const backToTop = document.getElementById('backToTop');
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTop?.classList.remove('opacity-0', 'invisible');
    } else {
      backToTop?.classList.add('opacity-0', 'invisible');
    }
  });
  
  backToTop?.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // ========== 模态框控制 ==========
  const addSiteModal = document.getElementById('addSiteModal');
  const addSiteBtnSidebar = document.getElementById('addSiteBtnSidebar');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelAddSite = document.getElementById('cancelAddSite');
  const addSiteForm = document.getElementById('addSiteForm');
  
  function openModal() {
    addSiteModal?.classList.remove('opacity-0', 'invisible');
    addSiteModal?.querySelector('.max-w-md')?.classList.remove('translate-y-8');
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
    addSiteModal?.classList.add('opacity-0', 'invisible');
    addSiteModal?.querySelector('.max-w-md')?.classList.add('translate-y-8');
    document.body.style.overflow = '';
  }
  
  async function fetchCategoriesForSelect() {
    const selectElement = document.getElementById('addSiteCatelog');
    if (!selectElement) return;

    try {
      const response = await fetch('/api/categories?pageSize=999');
      const data = await response.json();
      if (data.code === 200 && data.data) {
        selectElement.innerHTML = '<option value="" disabled selected>请选择一个分类</option>';
        data.data.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.catelog;
          selectElement.appendChild(option);
        });
      } else {
        selectElement.innerHTML = '<option value="" disabled>无法加载分类</option>';
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      selectElement.innerHTML = '<option value="" disabled>加载分类失败</option>';
    }
  }

  addSiteBtnSidebar?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
    fetchCategoriesForSelect();
  });
  
  closeModalBtn?.addEventListener('click', closeModal);
  cancelAddSite?.addEventListener('click', closeModal);
  addSiteModal?.addEventListener('click', (e) => {
    if (e.target === addSiteModal) closeModal();
  });
  
  // ========== 表单提交 ==========
  addSiteForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = {
      name: document.getElementById('addSiteName').value,
      url: document.getElementById('addSiteUrl').value,
      logo: document.getElementById('addSiteLogo').value,
      desc: document.getElementById('addSiteDesc').value,
      catelog_id: document.getElementById('addSiteCatelog').value
    };
    
    fetch('/api/config/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
      if (data.code === 201) {
        showToast('提交成功,等待管理员审核');
        closeModal();
        addSiteForm.reset();
      } else {
        alert(data.message || '提交失败');
      }
    })
    .catch(err => {
      console.error('网络错误:', err);
      alert('网络错误,请稍后重试');
    });
  });
  
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-accent-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
  
  // ========== 搜索功能 ==========
  const searchInputs = document.querySelectorAll('.search-input-target');
  const sitesGrid = document.getElementById('sitesGrid');
  let currentSearchEngine = 'local'; // Default to local

  // Search Engine Switching Logic
  const engineOptions = document.querySelectorAll('.search-engine-option');
  engineOptions.forEach(option => {
      option.addEventListener('click', () => {
          currentSearchEngine = option.dataset.engine;
          
          // Update UI: Sync all option sets (desktop/mobile)
          const allOptions = document.querySelectorAll('.search-engine-option');
          allOptions.forEach(opt => {
              if (opt.dataset.engine === currentSearchEngine) {
                  opt.classList.add('active');
              } else {
                  opt.classList.remove('active');
              }
          });
          
          // Update Placeholder
          let placeholder = '搜索书签...';
          switch (currentSearchEngine) {
              case 'google': placeholder = 'Google 搜索...'; break;
              case 'baidu': placeholder = '百度搜索...'; break;
              case 'bing': placeholder = 'Bing 搜索...'; break;
          }
          
          searchInputs.forEach(input => {
              input.placeholder = placeholder;
              input.focus();
              // If switching back to local, trigger filter immediately
              if (currentSearchEngine === 'local') {
                  input.dispatchEvent(new Event('input'));
              }
          });
      });
  });
  
  searchInputs.forEach(input => {
    // Local Search Input Handler
    input.addEventListener('input', function() {
        // If external engine is selected, do not filter local sites (optional, but better UX)
        // But keeping it might be confusing. Let's filter only if local.
        if (currentSearchEngine !== 'local') return;

        const keyword = this.value.toLowerCase().trim();
        // Sync other inputs
        searchInputs.forEach(otherInput => {
            if (otherInput !== this) {
                otherInput.value = this.value;
            }
        });

        const cards = sitesGrid?.querySelectorAll('.site-card');
        
        cards?.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const url = (card.dataset.url || '').toLowerCase();
        const catalog = (card.dataset.catalog || '').toLowerCase();
        const desc = (card.dataset.desc || '').toLowerCase();
        
        if (name.includes(keyword) || url.includes(keyword) || catalog.includes(keyword) || desc.includes(keyword)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
        });
        
        updateHeading(keyword);
    });

    // External Search Enter Handler
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && currentSearchEngine !== 'local') {
            e.preventDefault();
            const query = this.value.trim();
            if (query) {
                let url = '';
                switch (currentSearchEngine) {
                    case 'google': url = `https://www.google.com/search?q=${encodeURIComponent(query)}`; break;
                    case 'baidu': url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`; break;
                    case 'bing': url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`; break;
                }
                if (url) window.open(url, '_blank');
            }
        }
    });
  });
  
  function updateHeading(keyword, activeCatalog, count) {
    const heading = document.querySelector('[data-role="list-heading"]');
    if (!heading) return;
    
    const visibleCount = (count !== undefined) ? count : (sitesGrid?.querySelectorAll('.site-card:not(.hidden)').length || 0);
    
    // Explicitly handle navigation state
    if (activeCatalog !== undefined) {
        if (activeCatalog) {
            heading.dataset.active = activeCatalog;
        } else {
            // Null or empty string means "All Categories"
            delete heading.dataset.active;
        }
    }
    
    if (keyword) {
      heading.textContent = `搜索结果 · ${visibleCount} 个网站`;
    } else {
      const currentActive = heading.dataset.active;
      if (currentActive) {
          heading.textContent = `${currentActive} · ${visibleCount} 个网站`;
      } else {
          heading.textContent = `全部收藏 · ${visibleCount} 个网站`;
      }
    }
  }
  
  // ========== 一言 API ==========
  const hitokotoContainer = document.querySelector('#hitokoto').parentElement;
  // 检查容器是否被隐藏，如果隐藏则不发起请求
  if (hitokotoContainer && !hitokotoContainer.classList.contains('hidden')) {
    console.log('[Debug] Fetching hitokoto...');
    fetch('https://v1.hitokoto.cn')
      .then(res => res.json())
      .then(data => {
        const hitokoto = document.getElementById('hitokoto_text');
        if (hitokoto) {
          hitokoto.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
          hitokoto.innerText = data.hitokoto;
        }
      })
      .catch(console.error);
  }

  // ========== Horizontal Menu Overflow Logic ==========
  const navContainer = document.getElementById('horizontalCategoryNav');
  const moreWrapper = document.getElementById('horizontalMoreWrapper');
  const moreBtn = document.getElementById('horizontalMoreBtn');
  const dropdown = document.getElementById('horizontalMoreDropdown');
  
  // Define these globally within the scope so updateNavigationState can use them
  let checkOverflow = () => {};
  let resetNav = () => {};

  if (navContainer && moreWrapper && moreBtn && dropdown) {
    resetNav = () => {
        // Move items back from dropdown to navContainer (before moreWrapper)
        const dropdownItems = Array.from(dropdown.children);
        // We prepended to dropdown, so the order in dropdown is [N, N+1...].
        // We should append them back in order.
        // Actually, checkOverflow prepends from the end. So if we had 1,2,3,4,5.
        // Wrap -> 5 moved. Dropdown [5].
        // Wrap -> 4 moved. Dropdown [4, 5].
        // So dropdown order is correct sequence.
        // We just need to insert them back before moreWrapper.
        dropdownItems.forEach(item => {
            // Restore wrapper styles if saved
            if (item.dataset.originalClass) {
                item.className = item.dataset.originalClass;
            }
            
            // Restore inner link styles
            const link = item.querySelector('a');
            if (link && link.dataset.originalClass) {
                link.className = link.dataset.originalClass;
            }

            navContainer.insertBefore(item, moreWrapper);
        });
        
        moreWrapper.classList.add('hidden');
        dropdown.classList.add('hidden');
        moreBtn.classList.remove('active', 'text-primary-600', 'bg-secondary-100');
        moreBtn.classList.add('inactive');
    };

    checkOverflow = () => {
        resetNav();
        
        // Filter visible category items (exclude moreWrapper which is hidden now)
        // Actually moreWrapper is child of navContainer.
        const navChildren = Array.from(navContainer.children).filter(el => el !== moreWrapper);
        
        if (navChildren.length === 0) return;
        
        const firstTop = navChildren[0].offsetTop;
        const lastItem = navChildren[navChildren.length - 1];
        
        // Check if last item wraps
        if (lastItem.offsetTop === firstTop) {
            // No wrapping even for the last item -> All fit!
            navContainer.style.overflow = 'visible';
            return;
        }
        
        // Wrapping detected! Show the "More" button to participate in layout
        moreWrapper.classList.remove('hidden');
        
        // Loop to move items to dropdown until everything fits on one line
        // We check if "moreWrapper" (which is now the last item) wraps.
        // Or if the item before it wraps.
        while (true) {
             // Current visible items (categories)
             const currentCategories = Array.from(navContainer.children).filter(el => el !== moreWrapper && el.style.display !== 'none');
             
             if (currentCategories.length === 0) break; // Should not happen
             
             const lastCategory = currentCategories[currentCategories.length - 1];
             
             // Check condition: Does "moreWrapper" wrap? Or does "lastCategory" wrap?
             // (We want everything on the first line)
             const moreWrapperWraps = moreWrapper.offsetTop > firstTop;
             const lastCategoryWraps = lastCategory.offsetTop > firstTop;
             
             if (!moreWrapperWraps && !lastCategoryWraps) {
                 // Fits!
                 break;
             }
             
             // Doesn't fit. Move lastCategory to dropdown.
             // Prepend to maintain order (4, 5 -> [5] -> [4, 5])
             
             // Save wrapper class
             if (!lastCategory.dataset.originalClass) {
                 lastCategory.dataset.originalClass = lastCategory.className;
             }
            
             // Wrapper becomes a block item in dropdown
             lastCategory.className = 'menu-item-wrapper block w-full relative';
            
             // Adjust inner link style
             const link = lastCategory.querySelector('a');
             if (link) {
                 link.dataset.originalClass = link.className;
                 const isActive = link.classList.contains('active');
                 link.className = 'dropdown-item w-full text-left px-4 py-2 text-sm';
                 if (isActive) link.classList.add('active');
             }
             
             dropdown.insertBefore(lastCategory, dropdown.firstChild);
        }

        // Check if any item in dropdown is active and highlight More button
        const activeInDropdown = dropdown.querySelector('.active');
        if (activeInDropdown) {
             moreBtn.classList.add('active');
             moreBtn.classList.remove('inactive');
             moreBtn.classList.add('text-primary-600', 'bg-secondary-100');
        }

        // Restore overflow to visible to allow dropdowns (submenus) to show
        navContainer.style.overflow = 'visible';
    };

    // Initial check
    setTimeout(checkOverflow, 100);
    window.addEventListener('resize', () => {
        // Debounce
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(checkOverflow, 100);
    });

    // Toggle Dropdown
    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    // Close on click inside dropdown
    dropdown.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            dropdown.classList.add('hidden');
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !moreBtn.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
  }

  // ========== AJAX Navigation ==========
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a[href^="?catalog="]');
    if (!link) return;
    
    // Allow new tab clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    const href = link.getAttribute('href');
    const catalogId = link.getAttribute('data-id');
    
    // 优先使用 data-name (横向菜单可能没有), 其次 textContent
    // 但侧边栏现在有 svg，text content 会包含换行符。需要 trim。
    let catalogName = link.textContent.trim();
    
    if (typeof closeSidebarMenu === 'function') {
        closeSidebarMenu();
    }
    
    const sitesGrid = document.getElementById('sitesGrid');
    if (!sitesGrid) return;

    sitesGrid.style.transition = 'opacity 0.15s ease-out';
    sitesGrid.style.opacity = '0';

    try {
        let apiUrl = '/api/config?pageSize=10000';
        if (catalogId) {
            apiUrl += `&catalogId=${catalogId}`;
        }
        
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('网络请求失败');
        const data = await res.json();
        
        if (data.code !== 200) throw new Error(data.message || 'API 错误');
        
        await new Promise(resolve => setTimeout(resolve, 150));

        sitesGrid.style.transition = 'none';
        sitesGrid.style.opacity = '1';

        renderSites(data.data);
        updateHeading(null, catalogId ? catalogName : null, data.data.length);
        updateNavigationState(href);

    } catch (err) {
        console.error('导航跳转失败:', err);
        window.location.href = href;
    }
  });

  function renderSites(sites) {
    console.log('renderSites sites:', sites);
      const sitesGrid = document.getElementById('sitesGrid');
      if (!sitesGrid) return;
      
      // 使用全局配置获取布局设置，避免依赖 DOM 推断
      const config = window.IORI_LAYOUT_CONFIG || {};
      const isFiveCols = config.gridCols === '5';
      const isSixCols = config.gridCols === '6';
      const hideDesc = config.hideDesc === true;
      const hideLinks = config.hideLinks === true;
      const hideCategory = config.hideCategory === true;
      const cardStyle = config.cardStyle || 'style1';
      
      // 优先从配置获取毛玻璃开关状态，CSS 变量作为回退
      const computedStyle = getComputedStyle(document.documentElement);
      const frostedBlurVal = computedStyle.getPropertyValue('--frosted-glass-blur').trim();
      const isFrostedEnabled = config.enableFrostedGlass !== undefined 
          ? config.enableFrostedGlass 
          : (frostedBlurVal !== '');
      
      sitesGrid.innerHTML = '';
      
      if (sites.length === 0) {
          sitesGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">本分类下暂无书签</div>';
          return;
      }

      sites.forEach((site, index) => {
        console.log('[Debug] Rendering site:', site);
        const safeName = escapeHTML(site.name || '未命名');
        const safeUrl = normalizeUrl(site.url);
        const safeDesc = escapeHTML(site.desc || '暂无描述');
        const safeCatalog = escapeHTML(site.catelog_name || site.catelog || '未分类');
        const cardInitial = (safeName.charAt(0) || '站').toUpperCase();
        
        let logoHtml = '';
        if (site.logo) {
             logoHtml = `<img src="${escapeHTML(site.logo)}" alt="${safeName}" class="w-10 h-10 rounded-lg object-cover bg-gray-100">`;
        } else {
             logoHtml = `<div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-lg shadow-inner">${cardInitial}</div>`;
        }
        
        const descHtml = hideDesc ? '' : `<p class="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2" title="${safeDesc}">${safeDesc}</p>`;
        
        const hasValidUrl = !!safeUrl;
        const linksHtml = hideLinks ? '' : `
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs text-primary-600 truncate max-w-[140px]" title="${safeUrl}">${safeUrl || '未提供链接'}</span>
            <button class="copy-btn relative flex items-center px-2 py-1 ${hasValidUrl ? 'bg-accent-100 text-accent-700 hover:bg-accent-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} rounded-full text-xs font-medium transition-colors" data-url="${safeUrl}" ${hasValidUrl ? '' : 'disabled'}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ${isFiveCols || isSixCols ? '' : 'mr-1'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              ${isFiveCols || isSixCols ? '' : '<span class="copy-text">复制</span>'}
              <span class="copy-success hidden absolute -top-8 right-0 bg-accent-500 text-white text-xs px-2 py-1 rounded shadow-md">已复制!</span>
            </button>
          </div>`;
          
        const categoryHtml = hideCategory ? '' : `
                <span class="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-secondary-100 text-primary-700">
                  ${safeCatalog}
                </span>`;
        
        const frostedClass = isFrostedEnabled ? 'frosted-glass-effect' : '';
        const cardStyleClass = cardStyle === 'style2' ? 'style-2' : '';
        const baseCardClass = isFrostedEnabled
            ? 'site-card group overflow-hidden transition-all' 
            : 'site-card group bg-white border border-primary-100/60 shadow-sm overflow-hidden';
        
        const card = document.createElement('div');
        card.className = `${baseCardClass} ${frostedClass} ${cardStyleClass} card-anim-enter`;
        const delay = Math.min(index, 20) * 30;
        if (delay > 0) {
            card.style.animationDelay = `${delay}ms`;
        }
        card.style.pointerEvents = 'none'; // Prevent hover during animation
        
        // Fix: Remove animation class and style after completion to restore hover effects
        card.addEventListener('animationend', () => {
            card.classList.remove('card-anim-enter');
            // Force reflow to ensure clean state transition
            void card.offsetWidth;
            // Delay enabling interaction by one frame to ensure transition property is active before hover
            requestAnimationFrame(() => {
                card.removeAttribute('style');
            });
        }, { once: true });
        
        card.setAttribute('data-name', safeName);
        card.setAttribute('data-url', safeUrl);
        card.setAttribute('data-catalog', safeCatalog);
        card.setAttribute('data-desc', safeDesc);
        
        card.innerHTML = `
        <div class="site-card-content">
          <a href="${safeUrl}" ${hasValidUrl ? 'target="_blank" rel="noopener noreferrer"' : ''} class="block">
            <div class="flex items-start">
              <div class="site-icon flex-shrink-0 mr-4 transition-all duration-300">
                ${logoHtml}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="site-title text-base font-medium text-gray-900 truncate transition-all duration-300 origin-left" title="${safeName}">${safeName}</h3>
                ${categoryHtml}
              </div>
            </div>
            ${descHtml}
          </a>
          ${linksHtml}
        </div>
        `;
        
        sitesGrid.appendChild(card);
        
        const copyBtn = card.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const url = this.getAttribute('data-url');
                if (!url) return;
                
                navigator.clipboard.writeText(url).then(() => {
                    showCopySuccess(this);
                }).catch(() => {
                    const textarea = document.createElement('textarea');
                    textarea.value = url;
                    textarea.style.position = 'fixed';
                    document.body.appendChild(textarea);
                    textarea.select();
                    try { document.execCommand('copy'); showCopySuccess(this); } catch (e) {}
                    document.body.removeChild(textarea);
                });
            });
        }
      });
  }

  function updateNavigationState(href) {
      // 1. Reset everything to main container first
      if (resetNav) resetNav();
      
      // 2. Update states on standard nav items
      const navContainer = document.getElementById('horizontalCategoryNav');
      if (navContainer) {
          const links = navContainer.querySelectorAll('a.nav-btn, a.dropdown-item');
          links.forEach(link => {
              const linkHref = link.getAttribute('href');
              if (linkHref === href) {
                  link.classList.remove('inactive');
                  link.classList.add('active', 'nav-item-active');
              } else {
                  link.classList.remove('active', 'nav-item-active');
                  link.classList.add('inactive');
              }
              link.dataset.originalClass = link.className;
          });
          
          // Parent highlighting
          const topWrappers = Array.from(navContainer.children);
          topWrappers.forEach(wrapper => {
              const topLink = wrapper.querySelector(':scope > a.nav-btn'); 
              if (!topLink) return;
              
              if (href !== topLink.getAttribute('href')) {
                  const subLink = wrapper.querySelector(`a[href="${href}"]`);
                  if (subLink) {
                      topLink.classList.remove('inactive');
                      topLink.classList.add('active', 'nav-item-active');
                      topLink.dataset.originalClass = topLink.className;
                  }
              }
          });
      }
      
      // 3. Re-calculate overflow
      if (checkOverflow) checkOverflow();
      
      // Update Sidebar (Vertical Menu)
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
          const links = sidebar.querySelectorAll('a[href^="?catalog="]');
          links.forEach(link => {
               const svg = link.querySelector('svg');
               if (link.getAttribute('href') === href) {
                   // Active state
                   link.classList.remove('hover:bg-gray-100', 'text-gray-700');
                   link.classList.add('bg-secondary-100', 'text-primary-700');
                   
                   if (svg) {
                       svg.classList.remove('text-gray-400');
                       svg.classList.add('text-primary-600');
                   }
               } else {
                   // Inactive state
                   link.classList.remove('bg-secondary-100', 'text-primary-700');
                   link.classList.add('hover:bg-gray-100', 'text-gray-700');
                   
                   if (svg) {
                       svg.classList.remove('text-primary-600');
                       svg.classList.add('text-gray-400');
                   }
               }
          });
      }
  }

  // 辅助函数
  function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  
  function normalizeUrl(url) {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      return 'https://' + url;
  }
});