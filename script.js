document.addEventListener('DOMContentLoaded', () => {
    const jsI18n = {
        "enter_password": "비밀번호를 입력하세요 <span>(대소문자 구분)</span>",
        "password_placeholder": "비밀번호 입력",
        "confirm_button": "확인",
        "cancel_button": "취소",
        "wrong_password_alert": "비밀번호가 틀렸습니다. 대소문자를 정확히 입력해주세요.",
        "lang_file_missing_alert": "선택한 언어 파일을 찾을 수 없습니다. 기존 언어로 유지됩니다.",
        "search_index_failed": "검색 인덱스를 불러오는데 실패했습니다.",
        "search_function_error": "검색 기능에 오류가 발생했습니다.",
        "search_loading": "검색 인덱스를 로딩 중입니다. 잠시 후 다시 시도해주세요.",
        "snippet_unavailable": "내용 요약을 불러올 수 없습니다.",
        "no_search_results": "\"{query}\"에 대한 검색 결과가 없습니다.",
        "helper_open_label": "도우미 열기",
        "helper_close_label": "도우미 종료",
        "helper_link_about_lab": "🔬 우리 연구실이 어떤 연구를 하는지 궁금하신가요?",
        "helper_link_bp_eng": "🧫 생물공정공학이 뭔지 쉽고 빠르게 알려드릴까요?",
        "helper_link_proc_opt": "🚀 세포배양 효율을 높이는 최적의 방법이 궁금하세요?",
        "helper_link_meta_eng": "🧬 시스템 대사공학과 배지 최적화의 중요성, 알고 싶으세요?",
        "helper_link_cfd": "💻 CFD(전산유체역학)를 쉽게 이해하고 싶으신가요?",
        "helper_link_digital_twin": "🌐 디지털 트윈을 이용한 바이오공정, 어떻게 구현할 수 있을까요?",
        "helper_link_useful_tools": "🔧 유용한 연구 도구가 필요하세요? 여기서 바로 사용해보세요!",
        "helper_link_lab_resources": "📚 유용한 자료가 필요하세요? 여기서 바로 찾아보세요!",
        "back_to_top_label": "맨 위로 가기",
        "back_to_top_text": "↑ Top"
    };
    const fixedNavContainer = document.getElementById('fixed-top-nav-container');
    const mainNav = document.getElementById('mainNav');
    const breadcrumbNav = document.getElementById('breadcrumbNav');

    if (mainNav) {
        mainNav.setAttribute('role', 'navigation');
        if (!mainNav.getAttribute('aria-label')) {
            mainNav.setAttribute('aria-label', '주요 메뉴');
        }
    }

    if (fixedNavContainer && mainNav && breadcrumbNav) {
        const firstContainer = fixedNavContainer.querySelector('div.container');
        const headerFlex = firstContainer?.querySelector('.header-container') || firstContainer?.querySelector('.flex-col');

        function placeNavForDesktop() {
            if (firstContainer && firstContainer.contains(mainNav)) {
                fixedNavContainer.insertBefore(mainNav, breadcrumbNav);
            }
        }

        function placeNavForMobile() {
            if (firstContainer && !firstContainer.contains(mainNav)) {
                const referenceNode = headerFlex?.children[1] || headerFlex?.lastChild || firstContainer.firstChild;
                if (headerFlex) {
                    headerFlex.insertBefore(mainNav, referenceNode);
                } else {
                    firstContainer.insertBefore(mainNav, referenceNode);
                }
            }
        }

        function updateNavPlacement() {
            if (window.innerWidth >= 1024) {
                placeNavForDesktop();
            } else {
                placeNavForMobile();
            }
            adjustBodyPadding();
        }

        updateNavPlacement();
        window.addEventListener('resize', updateNavPlacement);
    }

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'lab_resources.html' || currentPage === 'resources.html') {
        if (localStorage.getItem('authed') !== 'ok') {
            localStorage.setItem('next', location.pathname);
            window.location.href = '/password.html';
            return;
        }
    }

    if (fixedNavContainer && mainNav) {
        const headerFlex = fixedNavContainer.querySelector('.flex-col');
        if (headerFlex) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle sm:hidden p-2 text-gray-700';
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-controls', 'mainNav');
            menuToggle.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
            headerFlex.appendChild(menuToggle);
            menuToggle.addEventListener('click', () => {
                const expanded = mainNav.classList.toggle('active');
                menuToggle.innerHTML = expanded
                    ? '<i data-lucide="x" class="w-6 h-6"></i>'
                    : '<i data-lucide="menu" class="w-6 h-6"></i>';
                menuToggle.setAttribute('aria-expanded', expanded);
                if (lucide) lucide.createIcons();
            });

            if (lucide) lucide.createIcons();
        }
    }
    
    function adjustBodyPadding() {
        if (fixedNavContainer) {
            const height = fixedNavContainer.offsetHeight;
            document.body.style.paddingTop = height + 'px';
        }
    }

    

    const defaultTexts = { ...jsI18n };

    // Store default texts for elements using data-i18n to allow reverting
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (!(key in defaultTexts)) {
            defaultTexts[key] = el.hasAttribute('placeholder') ? (el.placeholder || '') : (el.textContent || '');
        }
    });

    function applyTexts(texts) {
        // Apply translations for elements marked with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (key in texts) {
                if (el.hasAttribute('placeholder')) {
                    el.placeholder = texts[key];
                } else {
                    el.textContent = texts[key];
                }
            }
        });

        Object.keys(jsI18n).forEach(k => {
            if (k in texts) {
                jsI18n[k] = texts[k];
            }
        });

        // Legacy support: update elements referenced by id keys
        Object.keys(texts).forEach(key => {
            if (key === 'title') {
                document.title = texts[key];
            } else if (key.endsWith('_placeholder')) {
                const id = key.replace('_placeholder', '');
                const element = document.getElementById(id);
                if (element) element.placeholder = texts[key];
            } else {
                const element = document.getElementById(key);
                if (element) element.textContent = texts[key];
            }
        });
    }

    // A JSON copy of this menu structure is stored in menu.json for use by
    // external scripts such as generate_search_index.js
    const menuStructure = [
        { id: 'about_lab', name_ko: '연구실 소개', name_en: 'About Lab', path: 'about_lab.html', children: [
            { name_ko: '연구실 개요', name_en: 'Overview', path: 'lab_overview.html' },
            { name_ko: '연구 분야', name_en: 'Research Areas', path: 'research_areas.html' },
            { name_ko: '연구 목표 및 비전', name_en: 'Goals & Vision', path: 'research_goals_vision.html' },
            { name_ko: '교수 소개', name_en: 'Professor', path: 'professor_introduction.html' },
            { name_ko: '연구원 소개', name_en: 'Members', path: 'researchers_introduction.html' },
            { name_ko: '주요 연구 프로젝트', name_en: 'Major Projects', path: 'major_research_projects.html' },
            { name_ko: '연구실 소식 및 공지사항', name_en: 'News & Announcements', path: 'news_announcements.html' },
            { name_ko: '실험실 시설 및 장비', name_en: 'Facilities & Equipment', path: 'lab_facilities_equipment.html' },
            { name_ko: '연구 성과', name_en: 'Achievements', path: 'research_achievements.html' },
            { name_ko: '협력기관 및 파트너', name_en: 'Partners', path: 'collaborations_partners.html' },
            { name_ko: '사진 갤러리', name_en: 'Photo Gallery', path: 'photo_gallery.html' }
        ] },
        {
            id: 'bp_eng', name_ko: '생물공정공학', name_en: 'Bioprocess Engineering', path: 'bp_eng_main.html',
            children: [
                { name_ko: '소개', name_en: 'Introduction', path: 'bp_eng_intro_main.html', children: [
                    { name_ko: '개념 및 범위', name_en: 'Concept & Scope', path: 'bp_eng_intro_concept_scope.html' },
                    { name_ko: '바이오의약품 제조 공정 개요', name_en: 'Biopharmaceutical Manufacturing Overview', path: 'bp_eng_intro_biopharma_overview.html' }
                ]},
                { name_ko: '업스트림 공정', name_en: 'Upstream Processing', path: 'bp_eng_upstream_main.html', children: [
                    { name_ko: '세포주 개발', name_en: 'Cell Line Development', path: 'bp_eng_upstream_cell_line_dev.html' },
                    { name_ko: '세포배양 배지 최적화', name_en: 'Cell Culture Media Optimization', path: 'bp_eng_upstream_media_opt.html' },
                    { name_ko: '배양 조건 설계 및 최적화', name_en: 'Culture Condition Design & Optimization', path: 'bp_eng_upstream_culture_condition.html' },
                    { name_ko: '바이오리액터 운전 전략', name_en: 'Bioreactor Operation Strategy', path: 'bp_eng_upstream_bioreactor_strategy.html' },
                    { name_ko: '공정 스케일업·다운', name_en: 'Process Scale‑up & Scale‑down', path: 'bp_eng_upstream_scaleup_down.html' }
                ]},
                { name_ko: '동물 세포 배양', name_en: 'Animal Cell Culture', path: 'bp_eng_animal_cell_main.html', children: [
                    { name_ko: 'CHO 세포 배양', name_en: 'CHO Cell Culture', path: 'bp_eng_animal_cell_cho.html' },
                    { name_ko: 'HEK293 세포 배양', name_en: 'HEK293 Cell Culture', path: 'bp_eng_animal_cell_hek293.html' },
                    { name_ko: '기타 세포주 배양', name_en: 'Other Animal Cell Lines', path: 'bp_eng_animal_cell_other.html' }
                ]},
                { name_ko: '다운스트림 공정', name_en: 'Downstream Processing', path: 'bp_eng_downstream_main.html', children: [
                    { name_ko: '수확 및 정화', name_en: 'Harvest & Clarification', path: 'bp_eng_downstream_harvest_clarification.html' },
                    { name_ko: '캡처 정제', name_en: 'Primary Capture', path: 'bp_eng_downstream_primary_capture.html' },
                    { name_ko: '중간 정제', name_en: 'Intermediate Purification', path: 'bp_eng_downstream_intermediate_purification.html' },
                    { name_ko: '고도 정제 (폴리싱)', name_en: 'Polishing Purification', path: 'bp_eng_downstream_polishing_purification.html' },
                    { name_ko: '바이러스 제거 및 불활화', name_en: 'Viral Clearance', path: 'bp_eng_downstream_viral_clearance.html' },
                    { name_ko: '최종 제형 및 충전', name_en: 'Formulation & Fill‑Finish', path: 'bp_eng_downstream_formulation_fill_finish.html' }
                ]}
            ]
        },
        {
            id: 'proc_opt', name_ko: '공정 최적화', name_en: 'Process Optimization', path: 'proc_opt_main.html',
            children: [
                { name_ko: '연구 개요', name_en: 'Overview', path: 'proc_opt_overview_main.html', children: [
                    { name_ko: '연구 목적 및 필요성', name_en: 'Purpose & Necessity', path: 'proc_opt_overview_purpose_necessity.html' },
                    { name_ko: '접근 전략', name_en: 'Approach & Strategy', path: 'proc_opt_overview_approach_strategy.html' }
                ]},
                { name_ko: '배양 공정 설계 및 분석', name_en: 'Process Development & Analytics', path: 'proc_opt_dev_analytics_main.html', children: [
                    { name_ko: '공정 조건 최적화', name_en: 'Process Parameter Optimization', path: 'proc_opt_dev_analytics_param_opt.html' },
                    { name_ko: '데이터 기반 공정 분석', name_en: 'Data‑driven Process Analytics', path: 'proc_opt_dev_analytics_data_driven.html' }
                ]},
                { name_ko: '최신 연구 동향', name_en: 'Latest Research Trends', path: 'proc_opt_trends_main.html', children: [
                    { name_ko: '주요 연구 성과', name_en: 'Publications & Patents', path: 'proc_opt_trends_publications_patents.html' },
                    { name_ko: '최근 산업 및 학술 동향', name_en: 'Industry & Academic Trends', path: 'proc_opt_trends_industry_academic.html' }
                ]}
            ]
        },
        {
            id: 'meta_eng', name_ko: '시스템 대사공학 및 배지 최적화', name_en: 'Metabolic Engineering & Media Optimization', path: 'meta_eng_main.html',
            children: [
                { name_ko: '연구 개요', name_en: 'Overview', path: 'meta_eng_overview_main.html', children: [
                    { name_ko: '연구 배경 및 목적', name_en: 'Background & Objectives', path: 'meta_eng_overview_background_objectives.html' },
                    { name_ko: '기술적 접근 방법', name_en: 'Technical Approach', path: 'meta_eng_overview_technical_approach.html' }
                ]},
                { name_ko: '모델 기반 배지 설계', name_en: 'Model‑guided Media Design', path: 'meta_eng_model_media_design_main.html', children: [
                    { name_ko: '대사 모델 기반 배지 최적화', name_en: 'Metabolic Model‑driven Media Optimization', path: 'meta_eng_model_media_design_metabolic_model_opt.html' },
                    { name_ko: '배지 개발 자동화 시스템', name_en: 'Automated Media Development System', path: 'meta_eng_model_media_design_automated_dev.html' }
                ]},
                { name_ko: '최신 연구 동향', name_en: 'Latest Research Trends', path: 'meta_eng_trends_main.html', children: [
                    { name_ko: '주요 연구 성과', name_en: 'Publications & Patents', path: 'meta_eng_trends_publications_patents.html' },
                    { name_ko: '산업계 적용 사례', name_en: 'Industrial Application Cases', path: 'meta_eng_trends_industrial_app.html' }
                ]}
            ]
        },
        {
            id: 'cfd', name_ko: '전산유체역학', name_en: 'Computational Fluid Dynamics', path: 'cfd_main.html',
            children: [
                { name_ko: 'CFD 이론', name_en: 'CFD Theory', path: 'cfd_theory.html', children: [
                    { name_ko: 'CFD 소개', name_en: 'CFD Introduction', path: 'cfd_introduction.html' },
                    { name_ko: '핵심 이론', name_en: 'Core Principles', path: 'cfd_core_theory.html' },
                    { name_ko: '전처리 과정', name_en: 'Pre‑processing', path: 'cfd_preprocessing.html' },
                    { name_ko: '해석 과정', name_en: 'Simulation Process', path: 'cfd_solving.html' },
                    { 
                        name_ko: '후처리 과정', name_en: 'Post‑processing', path: 'cfd_postprocessing.html',
                        children: [
                            { name_ko: '시각화', name_en: 'Visualisation', path: 'cfd_post_visualisation.html'},
                            { name_ko: '통계 분석', name_en: 'Statistical Analysis', path: 'cfd_post_statistical_analysis.html'},
                            { name_ko: '데이터 처리', name_en: 'Data Handling', path: 'cfd_post_data_handling.html'},
                            { name_ko: '설계 및 불확실성 정량화', name_en: 'Design & UQ', path: 'cfd_post_design_uq.html'},
                            { name_ko: '파생 데이터 계산', name_en: 'Derived Data Calculation', path: 'cfd_post_derived_data.html'},
                            { name_ko: '정량적 데이터 추출', name_en: 'Quantitative Data Extraction', path: 'cfd_post_quantitative_extraction.html'},
                            { name_ko: '애니메이션 생성', name_en: 'Animation Generation', path: 'cfd_post_animation.html'},
                            { name_ko: '보고서 생성', name_en: 'Report Generation', path: 'cfd_post_report_generation.html'},
                            { name_ko: '최적 사례 및 팁', name_en: 'Best Practices & Tips', path: 'cfd_post_best_practices.html'},
                            { name_ko: '후처리 도구 개요', name_en: 'Tools Overview', path: 'cfd_post_tools_overview.html'}
                        ]
                    },
                    { name_ko: '검증 및 확인 (V&V)', name_en: 'Verification & Validation', path: 'cfd_verification_validation.html' },
                    { name_ko: '용어집', name_en: 'Glossary', path: 'cfd_terminology.html' },
                    { name_ko: '참고문헌', name_en: 'References', path: 'cfd_references.html' }
                ]},
                { name_ko: 'Bioprocess CFD Simulation', path: 'bioprocess_cfd.html', children: [
                    { name_ko: '소개', name_en: 'Introduction', path: 'bioprocess_cfd_introduction.html' },
                    { name_ko: '이론적 배경', name_en: 'Theoretical Background', path: 'bioprocess_cfd_theoretical_background.html' },
                    { name_ko: '적용 사례', name_en: 'Case Studies', path: 'bioprocess_cfd_application_cases.html' },
                    { name_ko: '소프트웨어 비교', name_en: 'Software Comparison', path: 'bioprocess_cfd_software_comparison.html' }
                ]},
                { name_ko: '소프트웨어', name_en: 'Software', path: 'software_index.html', children: [
                    { name_ko: 'M‑STAR CFD', name_en: 'M-STAR CFD', path: 'mstar_cfd_main.html', children: [
                        { name_ko: '소개', name_en: 'Introduction', path: 'mstar_cfd_introduction.html' },
                        { name_ko: '설치', name_en: 'Installation', path: 'mstar_cfd_installation.html' },
                        { name_ko: '전처리', name_en: 'Preprocessing', path: 'mstar_cfd_preprocessing.html' },
                        { name_ko: '해석 설정', name_en: 'Solver Setup', path: 'mstar_cfd_solver.html' },
                        { name_ko: '후처리', name_en: 'Postprocessing', path: 'mstar_cfd_postprocessing.html' },
                        { name_ko: '검증/확인', name_en: 'Verification & Validation', path: 'mstar_cfd_validation.html' },
                        { name_ko: '문제 해결', name_en: 'Troubleshooting', path: 'mstar_cfd_troubleshooting.html' },
                        { name_ko: '자료', name_en: 'Resources', path: 'mstar_cfd_resources.html' }
                    ]},
                    { name_ko: 'Ansys Fluent', name_en: 'Ansys Fluent', path: 'ansys_fluent_main.html', children: [
                        { name_ko: '소개', name_en: 'Introduction', path: 'ansys_fluent_introduction.html' },
                        { name_ko: '설치', name_en: 'Installation', path: 'ansys_fluent_installation.html' },
                        { name_ko: '전처리', name_en: 'Preprocessing', path: 'ansys_fluent_preprocessing.html' },
                        { name_ko: '해석 설정', name_en: 'Solver Setup', path: 'ansys_fluent_solver.html' },
                        { name_ko: '후처리', name_en: 'Postprocessing', path: 'ansys_fluent_postprocessing.html' },
                        { name_ko: '검증/확인', name_en: 'Verification & Validation', path: 'ansys_fluent_validation.html' },
                        { name_ko: '문제 해결', name_en: 'Troubleshooting', path: 'ansys_fluent_troubleshooting.html' },
                        { name_ko: '자료', name_en: 'Resources', path: 'ansys_fluent_resources.html' }
                    ]},
                    { name_ko: 'OpenFOAM', name_en: 'OpenFOAM', path: 'openfoam_main.html', children: [
                        { name_ko: '소개', name_en: 'Introduction', path: 'openfoam_introduction.html' },
                        { name_ko: '설치', name_en: 'Installation', path: 'openfoam_installation.html' },
                        { name_ko: '전처리', name_en: 'Preprocessing', path: 'openfoam_preprocessing.html' },
                        { name_ko: '해석 설정', name_en: 'Solver Setup', path: 'openfoam_solver.html' },
                        { name_ko: '후처리', name_en: 'Postprocessing', path: 'openfoam_postprocessing.html' },
                        { name_ko: '검증/확인', name_en: 'Verification & Validation', path: 'openfoam_validation.html' },
                        { name_ko: '문제 해결', name_en: 'Troubleshooting', path: 'openfoam_troubleshooting.html' },
                        { name_ko: '자료', name_en: 'Resources', path: 'openfoam_resources.html' }
                    ]}
                ]}
            ]
        },
        {
            id: 'digital_twin', name_ko: '디지털 트윈 기반 바이오공정', name_en: 'Digital Twin Bioprocess', path: 'digital_twin_main.html',
            children: [
                { name_ko: '연구 개요', name_en: 'Overview', path: 'digital_twin_overview_main.html', children: [
                    { name_ko: '디지털 트윈 개념과 필요성', name_en: 'Concept & Necessity', path: 'digital_twin_overview_concept_necessity.html' },
                    { name_ko: '연구 목표 및 전략', name_en: 'Objectives & Strategy', path: 'digital_twin_overview_objectives_strategy.html' }
                ]},
                { name_ko: '실시간 모니터링 · AI 공정 제어', name_en: 'Real‑time Monitoring & AI Control', path: 'digital_twin_monitoring_ai_main.html', children: [
                    { name_ko: '공정 데이터 통합 분석', name_en: 'Integrated Process Data Analytics', path: 'digital_twin_monitoring_ai_data_analytics.html' },
                    { name_ko: '인공지능 기반 최적 공정 제어', name_en: 'AI‑driven Optimal Process Control', path: 'digital_twin_monitoring_ai_optimal_control.html' }
                ]},
                { name_ko: '최신 연구 동향', name_en: 'Latest Research Trends', path: 'digital_twin_trends_main.html', children: [
                    { name_ko: '주요 연구 성과', name_en: 'Publications & Patents', path: 'digital_twin_trends_publications_patents.html' },
                    { name_ko: '최신 산업 적용 현황', name_en: 'Recent Industrial Applications', path: 'digital_twin_trends_industrial_app.html' }
                ]}
            ]
        },
        {
            id: 'useful_tools', name_ko: '유용한 도구', name_en: 'Useful Tools', path: 'useful_tools.html'
        },
        { id: 'resources', name_ko: '자료실', name_en: 'Resources', path: 'lab_resources.html' }
    ];
    
    function findPathInMenu(items, currentPath) {
        for (const item of items) {
            if (item.path && item.path.endsWith(currentPath)) {
                return [item];
            }
            if (item.children) {
                const foundInChildren = findPathInMenu(item.children, currentPath);
                if (foundInChildren.length > 0) {
                    return [item, ...foundInChildren];
                }
            }
        }
        return [];
    }

    function generateBreadcrumbs() {
        const breadcrumbNav = document.getElementById('breadcrumbNav');
        if (!breadcrumbNav) return;

        const container = breadcrumbNav.querySelector('.container');
        if (!container) return;
        
        container.innerHTML = ''; 
        const ol = document.createElement('ol');
        ol.className = 'flex items-center space-x-1';

        const pathParts = window.location.pathname.split('/');
        const currentPageFile = pathParts[pathParts.length - 1] || 'index.html';

        let breadcrumbPath;
        if (currentPageFile === 'index.html') {
            breadcrumbPath = [{ name_ko: '홈', path: 'index.html', isCurrent: true }];
        } else {
            breadcrumbPath = findPathInMenu(menuStructure, currentPageFile);
            if (breadcrumbPath.length > 0) {
                 breadcrumbPath[breadcrumbPath.length-1].isCurrent = true;
                 if (breadcrumbPath[0].path !== 'index.html' && breadcrumbPath[0].id !== 'home') { 
                    breadcrumbPath.unshift({ name_ko: '홈', path: 'index.html' });
                 }
            } else {
                 const pageTitle = document.title.split(' - ')[0] || document.title.split(' | ')[0];
                 breadcrumbPath = [
                    { name_ko: '홈', path: 'index.html'},
                    { name_ko: pageTitle, path: currentPageFile, isCurrent: true }
                 ];
                 const aboutLabSubPageTitles = {
                    'lab_overview.html': '연구실 개요',
                    'research_areas.html': '연구 분야',
                    'research_goals_vision.html': '연구 목표 및 비전',
                    'professor_introduction.html': '교수 소개',
                    'researchers_introduction.html': '연구원 소개',
                    'major_research_projects.html': '주요 연구 프로젝트',
                    'news_announcements.html': '연구실 소식 및 공지사항',
                    'lab_facilities_equipment.html': '실험실 시설 및 장비',
                    'research_achievements.html': '연구 성과',
                    'collaborations_partners.html': '협력기관 및 파트너',
                    'photo_gallery.html': '사진 갤러리',
                    'announcement_detail_1.html': '공지사항 상세',
                    'announcement_detail_2.html': '공지사항 상세',
                    'announcement_detail_generic.html': '공지사항 상세',
                    'lab_news_detail_1.html': '연구실 소식 상세',
                    'lab_news_detail_2.html': '연구실 소식 상세',
                    'lab_news_detail_generic.html': '연구실 소식 상세'
                 };
                 if (aboutLabSubPageTitles[currentPageFile] && (currentPageFile.startsWith('lab_') || currentPageFile.startsWith('announcement_') || currentPageFile.startsWith('research_') || currentPageFile.startsWith('professor_') || currentPageFile.startsWith('major_') || currentPageFile.startsWith('news_') || currentPageFile.startsWith('collaborations_') || currentPageFile.startsWith('photo_'))) {
                    let parentPage = 'about_lab.html';
                    let parentPageName = '연구실 소개';
                    if (currentPageFile.startsWith('announcement_') || currentPageFile.startsWith('lab_news_')) {
                        parentPage = 'news_announcements.html';
                        parentPageName = '연구실 소식 및 공지사항';
                         breadcrumbPath = [
                            { name_ko: '홈', path: 'index.html'},
                            { name_ko: '연구실 소개', path: 'about_lab.html'},
                            { name_ko: parentPageName, path: parentPage},
                            { name_ko: aboutLabSubPageTitles[currentPageFile] || pageTitle, path: currentPageFile, isCurrent: true}
                        ];
                    } else {
                         breadcrumbPath = [
                            { name_ko: '홈', path: 'index.html'},
                            { name_ko: parentPageName, path: parentPage},
                            { name_ko: aboutLabSubPageTitles[currentPageFile] || pageTitle, path: currentPageFile, isCurrent: true}
                        ];
                    }
                 }
            }
        }

        breadcrumbPath.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center';

            if (index > 0) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.innerHTML = '<i data-lucide="chevron-right" class="w-4 h-4 text-gray-400"></i>';
                ol.appendChild(separator);
            }
            
            if (item.isCurrent || index === breadcrumbPath.length - 1) {
                li.textContent = item.name_ko;
                li.className = 'current-page text-gray-600 font-medium';
            } else {
                const a = document.createElement('a');
                a.href = item.path || '#';
                a.textContent = item.name_ko;
                a.className = 'hover:underline text-[#0072CE] hover:text-[#004A99]';
                li.appendChild(a);
            }
            ol.appendChild(li);
        });
        container.appendChild(ol);
        if (lucide) lucide.createIcons();
    }
    
    function createMenuItem(item, level, currentPathArray) {
        const li = document.createElement('li');
        li.className = 'menu';
        if (level === 0) {
             li.classList.add('relative');
        }
        if(item.id) {
            li.dataset.menu = item.id;
        }

        const a = document.createElement('a');
        a.href = item.path || '#'; 
        
        if (level === 0) {
            a.className = 'px-3 sm:px-4 py-2 inline-block hover:bg-slate-600 transition-colors duration-150 flex flex-row items-center justify-center text-center';
            
            const textWrapper = document.createElement('div');
            textWrapper.className = 'menu-text-wrapper flex flex-col items-center justify-center';

            const koreanSpan = document.createElement('span');
            koreanSpan.className = 'menu-korean block text-sm';
            koreanSpan.textContent = item.name_ko;
            textWrapper.appendChild(koreanSpan);

            if (item.name_en && item.name_en !== item.name_ko) {
                const englishSpan = document.createElement('span');
                englishSpan.className = 'menu-english block text-xs opacity-80 mt-px';
                englishSpan.textContent = `(${item.name_en})`;
                textWrapper.appendChild(englishSpan);
            }
            a.appendChild(textWrapper);
        } else {
             a.className = 'block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 hover:text-slate-800';
             let linkText = item.name_ko;
             if (item.name_en && item.name_en !== item.name_ko) {
                 linkText += ` <span class="text-xs opacity-80">(${item.name_en})</span>`;
             }
             a.innerHTML = linkText;
        }

        let isActive = false;
        let isAncestor = false;

        if (currentPathArray && currentPathArray.length > 0) {
            const currentFile = currentPathArray[currentPathArray.length - 1].path;
            if (item.path && item.path.endsWith(currentFile)) {
                 isActive = true;
            }
             isAncestor = currentPathArray.slice(0, -1).some(p => p.path === item.path);
        }
        
        if(isActive) {
            li.classList.add('active');
            a.setAttribute('aria-current', 'page');
        }
        if(isAncestor) li.classList.add('active-ancestor');


        li.appendChild(a);

        if (item.children && item.children.length > 0) {
            li.classList.add('menu-item-has-children');
            li.setAttribute('aria-haspopup', 'true');
            a.setAttribute('aria-expanded', 'false');
            const arrowIconContainer = document.createElement('span');
            arrowIconContainer.className = 'ml-1 inline-block align-middle';
            if (level === 0) { 
                arrowIconContainer.classList.remove('ml-1'); 
            }

            const arrowIcon = document.createElement('i');
            arrowIcon.dataset.lucide = level === 0 ? 'chevron-down' : 'chevron-right';
            arrowIcon.className = 'w-4 h-4'; 
            arrowIconContainer.appendChild(arrowIcon);
            a.appendChild(arrowIconContainer);

            const ulDropdown = document.createElement('ul');
            ulDropdown.className = 'dropdown-menu';
             if (level === 0) {
                ulDropdown.classList.add('text-gray-700');
            }

            item.children.forEach(child => {
                ulDropdown.appendChild(createMenuItem(child, level + 1, currentPathArray));
            });
            li.appendChild(ulDropdown);
            
            const GNB_DELAY = 0; 

            li.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    if (level === 0) {
                        const allTopLevelLis = li.parentElement.querySelectorAll(':scope > li.menu-item-has-children');
                        allTopLevelLis.forEach(topLi => {
                            if (topLi !== li) {
                                const otherDropdown = topLi.querySelector('.dropdown-menu');
                                const otherLink = topLi.querySelector('a');
                                if (otherDropdown) {
                                    otherDropdown.style.display = 'none';
                                    otherDropdown.classList.remove('open');
                                    if (otherLink) otherLink.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });
                    } else {
                        const siblingDropdowns = li.parentElement.querySelectorAll(':scope > li > .dropdown-menu');
                        siblingDropdowns.forEach(sibDrop => {
                            if (sibDrop !== ulDropdown) {
                                sibDrop.style.display = 'none';
                                const parentLink = sibDrop.parentElement.querySelector('a');
                                sibDrop.classList.remove('open');
                                if (parentLink) parentLink.setAttribute('aria-expanded', 'false');
                            }
                        });
                    }
                    ulDropdown.style.display = 'block';
                    ulDropdown.classList.add('open');
                    a.setAttribute('aria-expanded', 'true');
                }
            });

            li.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    setTimeout(() => {
                        if (!li.matches(':hover')) {
                            ulDropdown.style.display = 'none';
                            ulDropdown.classList.remove('open');
                            a.setAttribute('aria-expanded', 'false');
                        }
                    }, GNB_DELAY);
                }
            });
            
            a.addEventListener('click', (event) => {
                if (item.path === '#' || (window.innerWidth <= 768 && level === 0 && item.children && item.children.length > 0)) {
                    event.preventDefault();
                    const currentlyOpen = ulDropdown.classList.contains('open');
                    if (level === 0 && window.innerWidth <= 768) {
                        const allTopLevelLis = li.parentElement.querySelectorAll(':scope > li.menu-item-has-children');
                        allTopLevelLis.forEach(topLi => {
                            if (topLi !== li) {
                                const otherDropdown = topLi.querySelector('.dropdown-menu');
                                const otherLink = topLi.querySelector('a');
                                if (otherDropdown) {
                                    otherDropdown.classList.remove('open');
                                    if (otherLink) otherLink.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });
                    }
                    ulDropdown.classList.toggle('open', !currentlyOpen);
                    a.setAttribute('aria-expanded', currentlyOpen ? 'false' : 'true');
                }
            });
        }
        return li;
    }

    function generateNavigation() {
        const mainNavUl = document.querySelector('#mainNav ul');
        if (!mainNavUl) return;
        mainNavUl.innerHTML = '';

        const pathParts = window.location.pathname.split('/');
        const currentPageFile = pathParts[pathParts.length - 1] || 'index.html';
        const currentPathArray = findPathInMenu(menuStructure, currentPageFile);

        menuStructure.forEach(item => {
            mainNavUl.appendChild(createMenuItem(item, 0, currentPathArray));
        });
        if (lucide) lucide.createIcons();
    }


    adjustBodyPadding();
    window.addEventListener('resize', adjustBodyPadding);
    
    generateNavigation();
    generateBreadcrumbs();
    if (lucide) lucide.createIcons();

    const mainContent = document.querySelector('main');

    if (breadcrumbNav && mainContent) {
        const sentinel = document.createElement('div');
        sentinel.setAttribute('aria-hidden', 'true');
        sentinel.style.height = '1px';
        mainContent.parentNode.insertBefore(sentinel, mainContent);

        function updateBreadcrumbHeight() {
            const h = breadcrumbNav.scrollHeight;
            breadcrumbNav.style.maxHeight = h + 'px';
        }

        updateBreadcrumbHeight();
        window.addEventListener('resize', () => {
            updateBreadcrumbHeight();
            adjustBodyPadding();
        });

        breadcrumbNav.setAttribute('aria-expanded', 'true');

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const show = entry.isIntersecting;
                breadcrumbNav.classList.toggle('collapsed', !show);
                breadcrumbNav.setAttribute('aria-expanded', show ? 'true' : 'false');
                adjustBodyPadding();
            });
        });
        observer.observe(sentinel);
    }



    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsList = document.getElementById('searchResultsList');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const suggestionsDropdown = document.getElementById('suggestionsDropdown');
    
    let siteSearchIndex = null;
    let blurTimeout;
    const MAX_SUGGESTIONS = 7;

    async function loadSearchIndex() {
        try {
            const response = await fetch('search_index.json');
            if (!response.ok) {
                console.error('Failed to load search index. Status:', response.status);
                if (searchResultsList) searchResultsList.innerHTML = '<p class="text-red-500">' + jsI18n.search_index_failed + '</p>';
                if (searchResultsContainer) searchResultsContainer.style.display = 'block';
                return;
            }
            siteSearchIndex = await response.json();
        } catch (error) {
            console.error('Error fetching or parsing search index:', error);
            if (searchResultsList) searchResultsList.innerHTML = '<p class="text-red-500">' + jsI18n.search_function_error + '</p>';
            if (searchResultsContainer) searchResultsContainer.style.display = 'block';
        }
    }

    function escapeRegExp(string) {
        return string.replace(new RegExp('[.*+?^${}()|[\\]\\\\]', 'g'), '\\$&');
    }

    function highlightText(text, query) {
        if (!query || !text) return text;
        const regex = new RegExp(escapeRegExp(query), 'gi');
        return text.replace(regex, `<span class="highlight">$&</span>`);
    }

    function displaySuggestions(query) {
        if (!suggestionsDropdown || !siteSearchIndex || !query) {
            if (suggestionsDropdown) suggestionsDropdown.style.display = 'none';
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const results = siteSearchIndex.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(lowerCaseQuery);
            const contentMatch = item.full_text && item.full_text.toLowerCase().includes(lowerCaseQuery);
            const keywordMatch = item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseQuery));
            return titleMatch || contentMatch || keywordMatch;
        });

        suggestionsDropdown.innerHTML = '';
        if (results.length > 0) {
            results.slice(0, MAX_SUGGESTIONS).forEach(result => {
                const suggestionAnchor = document.createElement('a');
                suggestionAnchor.href = result.url;
                suggestionAnchor.className = 'suggestion-item block p-3 hover:bg-gray-100 cursor-pointer text-sm';

                const titleElement = document.createElement('div');
                titleElement.className = 'suggestion-item-title font-semibold text-gray-800 block';
                titleElement.innerHTML = highlightText(result.title, query);
                
                const snippetElement = document.createElement('div');
                snippetElement.className = 'suggestion-item-snippet text-xs text-gray-500 block mt-0.5';
                
                let snippetText = result.content_snippet || result.full_text || "";
                const queryIndex = snippetText.toLowerCase().indexOf(lowerCaseQuery);
                const snippetContextLength = 30; 

                if (queryIndex !== -1) {
                    const start = Math.max(0, queryIndex - snippetContextLength);
                    const end = Math.min(snippetText.length, queryIndex + query.length + snippetContextLength);
                    snippetText = snippetText.substring(start, end);
                    if (start > 0) snippetText = "..." + snippetText;
                    if (end < (result.content_snippet || result.full_text || "").length) snippetText = snippetText + "...";
                } else {
                     snippetText = snippetText.substring(0, 70) + (snippetText.length > 70 ? "..." : "");
                }
                snippetElement.innerHTML = highlightText(snippetText, query);

                suggestionAnchor.appendChild(titleElement);
                suggestionAnchor.appendChild(snippetElement);

                suggestionAnchor.addEventListener('mousedown', () => {
                    clearTimeout(blurTimeout);
                    window.location.href = result.url; 
                });
                suggestionsDropdown.appendChild(suggestionAnchor);
            });
            suggestionsDropdown.style.display = 'block';
        } else {
            suggestionsDropdown.style.display = 'none';
        }
    }

    function performSiteSearch() {
        if (suggestionsDropdown) suggestionsDropdown.style.display = 'none';
        
        const query = searchInput.value.trim();
        const lowerCaseQuery = query.toLowerCase();
        
        if (!searchResultsList || !searchResultsContainer) {
            console.error("Search results display elements not found.");
            return;
        }
        searchResultsList.innerHTML = ''; 

        if (!query) {
            searchResultsContainer.style.display = 'none';
             if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                document.querySelector('.hero-section')?.style.removeProperty('display');
                document.querySelectorAll('main > section.py-16, main > section.py-24').forEach(s => s.style.removeProperty('display'));
            } else {
                const mainContentArea = document.querySelector('main > article, main > div > article, main > div:not(#searchResultsContainer):not(.bg-white)');
                if(mainContentArea) mainContentArea.style.removeProperty('display');
                
                const directMainDivBgWhite = document.querySelector('main > div.bg-white');
                 if(directMainDivBgWhite && !directMainDivBgWhite.querySelector('#searchResultsContainer')) {
                    directMainDivBgWhite.style.removeProperty('display');
                 }
            }
            return;
        }

        if (!siteSearchIndex) {
            searchResultsList.innerHTML = '<p class="text-gray-500">' + jsI18n.search_loading + '</p>';
            searchResultsContainer.style.display = 'block';
            loadSearchIndex();
            return;
        }

        const results = siteSearchIndex.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(lowerCaseQuery);
            const contentMatch = item.full_text && item.full_text.toLowerCase().includes(lowerCaseQuery);
            const keywordMatch = item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseQuery));
            return titleMatch || contentMatch || keywordMatch;
        });

        searchResultsContainer.style.display = 'block';
        document.querySelectorAll('main > section').forEach(section => section.style.display = 'none');


        if (results.length > 0) {
            results.forEach(result => {
                const listItem = document.createElement('div');
                listItem.className = 'search-result-item p-5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-150';

                const titleElement = document.createElement('a');
                titleElement.href = result.url;
                titleElement.className = 'text-lg font-semibold text-[#0072CE] hover:text-[#004A99] hover:underline';
                titleElement.innerHTML = highlightText(result.title, query);
                
                const snippetElement = document.createElement('p');
                snippetElement.className = 'text-sm text-gray-600 mt-1 snippet-text';
                
                let snippetText = result.content_snippet;
                const queryIndexFull = result.full_text && result.full_text.toLowerCase().indexOf(lowerCaseQuery);
                if (queryIndexFull !== -1 && result.full_text) {
                    const textAroundQuery = result.full_text.substring(Math.max(0, queryIndexFull - 75), Math.min(result.full_text.length, queryIndexFull + query.length + 75));
                    snippetText = (Math.max(0, queryIndexFull - 75) > 0 ? "..." : "") + textAroundQuery + ( (queryIndexFull + query.length + 75) < result.full_text.length ? "..." : "");
                } else if (!snippetText && result.full_text) {
                    snippetText = result.full_text.substring(0,150) + (result.full_text.length > 150 ? "..." : "");
                } else if (!snippetText) {
                    snippetText = jsI18n.snippet_unavailable;
                }
                
                snippetElement.innerHTML = highlightText(snippetText, query);

                const urlElement = document.createElement('p');
                urlElement.className = 'text-xs text-gray-500 mt-2';
                urlElement.textContent = result.url;

                listItem.appendChild(titleElement);
                listItem.appendChild(snippetElement);
                listItem.appendChild(urlElement);
                searchResultsList.appendChild(listItem);
            });
        } else {
            searchResultsList.innerHTML = '<p class="text-gray-500">' + jsI18n.no_search_results.replace('{query}', query) + '</p>';
        }
         if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            document.querySelector('.hero-section')?.style.setProperty('display', 'none', 'important');
            document.querySelectorAll('main > section.py-16, main > section.py-24').forEach(s => s.style.setProperty('display', 'none', 'important'));

        } else {
            const mainContentArea = document.querySelector('main > article, main > div > article, main > div:not(#searchResultsContainer):not(.bg-white)');
            if(mainContentArea) mainContentArea.style.setProperty('display', 'none', 'important');
            
            const directMainDivBgWhite = document.querySelector('main > div.bg-white');
             if(directMainDivBgWhite && !directMainDivBgWhite.querySelector('#searchResultsContainer')) {
                directMainDivBgWhite.style.setProperty('display', 'none', 'important');
             }
        }
    }

    if (searchInput && searchButton && searchResultsList && searchResultsContainer && suggestionsDropdown) {
        loadSearchIndex(); 
        
        searchButton.addEventListener('click', () => {
            performSiteSearch();
        });

        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                performSiteSearch();
            } else if (event.key === 'Escape') {
                suggestionsDropdown.style.display = 'none';
            }
        });

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            if (query.length > 0) {
                displaySuggestions(query);
            } else {
                suggestionsDropdown.style.display = 'none';
            }
        });
        
        searchInput.addEventListener('focus', () => {
            const query = searchInput.value.trim();
            if (query.length > 0 && siteSearchIndex && suggestionsDropdown.children.length > 0) {
                suggestionsDropdown.style.display = 'block';
            } else if (query.length > 0) {
                 displaySuggestions(query);
            }
        });

        searchInput.addEventListener('blur', () => {
            blurTimeout = setTimeout(() => {
                suggestionsDropdown.style.display = 'none';
            }, 150);
        });
        
        searchResultsContainer.style.display = 'none';
    } else {
        console.warn("Search UI elements not fully found on this page. Site-wide search functionality may be impaired.");
    }
// Helper Q&A button
let helperBtn = document.getElementById("helper-btn");
let helperMenu = document.getElementById("helper-menu");

if (!helperBtn) {
    helperBtn = document.createElement("div");
    helperBtn.id = "helper-btn";
    helperBtn.setAttribute("aria-label", jsI18n.helper_open_label);
    helperBtn.textContent = "\uD83D\uDCAC";

    helperMenu = document.createElement("div");
    helperMenu.id = "helper-menu";
    helperMenu.classList.add("hidden");
    helperMenu.innerHTML = `
        <button id="close-helper" aria-label="${jsI18n.helper_close_label}" data-i18n="helper_close_label">✖</button>
        <ul>
            <li><a href="about_lab.html" aria-label="연구실 소개" data-i18n="helper_link_about_lab">${jsI18n.helper_link_about_lab}</a></li>
            <li><a href="bp_eng_main.html" aria-label="생물공정공학 소개" data-i18n="helper_link_bp_eng">${jsI18n.helper_link_bp_eng}</a></li>
            <li><a href="proc_opt_main.html" aria-label="공정 최적화" data-i18n="helper_link_proc_opt">${jsI18n.helper_link_proc_opt}</a></li>
        <li><a href="meta_eng_main.html" aria-label="시스템 대사공학" data-i18n="helper_link_meta_eng">${jsI18n.helper_link_meta_eng}</a></li>
        <li><a href="cfd_main.html" aria-label="CFD 소개" data-i18n="helper_link_cfd">${jsI18n.helper_link_cfd}</a></li>
        <li><a href="digital_twin_main.html" aria-label="디지털 트윈" data-i18n="helper_link_digital_twin">${jsI18n.helper_link_digital_twin}</a></li>
        <li><a href="useful_tools.html" aria-label="유용한 도구" data-i18n="helper_link_useful_tools">${jsI18n.helper_link_useful_tools}</a></li>
        <li><a href="lab_resources.html" aria-label="연구실 자료" data-i18n="helper_link_lab_resources">${jsI18n.helper_link_lab_resources}</a></li>
    </ul>`;

    document.body.appendChild(helperBtn);
    document.body.appendChild(helperMenu);
}

if (sessionStorage.getItem("helperClosed")) {
    helperBtn.style.display = "none";
    helperMenu.style.display = "none";
}

const headerHelperBtn = document.getElementById('header-helper-btn');
if (headerHelperBtn && !headerHelperBtn.dataset.helperBound) {
    const attentionKey = 'helperAttentionPlayed_' + window.location.pathname;
    if (!sessionStorage.getItem(attentionKey)) {
        headerHelperBtn.classList.add('attention-animation');
        sessionStorage.setItem(attentionKey, 'true');
    }

    headerHelperBtn.addEventListener('click', () => {
        helperBtn.style.display = 'flex';
        helperMenu.classList.remove('hidden');
        helperMenu.style.display = 'block';
        sessionStorage.removeItem('helperClosed');
    });
    headerHelperBtn.dataset.helperBound = 'true';
}

if (!helperBtn.dataset.helperBound) {
    helperBtn.addEventListener("click", () => {
        const nowHidden = helperMenu.classList.toggle("hidden");
        helperMenu.style.display = nowHidden ? 'none' : 'block';
    });

    helperMenu.addEventListener("click", (e) => {
        if (e.target.id === "close-helper") {
            helperBtn.style.display = "none";
            helperMenu.style.display = "none";
            sessionStorage.setItem("helperClosed", "true");
        }
    });

    let dragging = false, offsetX = 0, offsetY = 0;

    const startDrag = (x, y) => {
        dragging = true;
        offsetX = x - helperBtn.offsetLeft;
        offsetY = y - helperBtn.offsetTop;
    };

    const onDrag = (x, y) => {
        if (!dragging) return;
        helperBtn.style.left = (x - offsetX) + "px";
        helperBtn.style.top = (y - offsetY) + "px";
        helperBtn.style.bottom = "auto";
        helperBtn.style.right = "auto";
        helperMenu.style.bottom = "auto";
        helperMenu.style.right = "auto";
        helperMenu.style.top = (y - offsetY - helperMenu.offsetHeight - 10) + "px";
        helperMenu.style.left = (x - offsetX) + "px";
    };

    helperBtn.addEventListener("mousedown", e => startDrag(e.clientX, e.clientY));
    document.addEventListener("mousemove", e => onDrag(e.clientX, e.clientY));
    document.addEventListener("mouseup", () => { dragging = false; });

    helperBtn.addEventListener("touchstart", e => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }, { passive: true });
    document.addEventListener("touchmove", e => { if (!dragging) return; e.preventDefault(); const t = e.touches[0]; onDrag(t.clientX, t.clientY); }, { passive: false });
    document.addEventListener("touchend", () => { dragging = false; });

    helperBtn.dataset.helperBound = 'true';



    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.setAttribute('aria-label', jsI18n.back_to_top_label);
    backToTop.textContent = jsI18n.back_to_top_text;
    backToTop.dataset.i18n = 'back_to_top_text';
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        backToTop.style.display = window.scrollY > 200 ? 'block' : 'none';
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
});
