function initializeVideoComparison() {
    $('.video-comparison-container').each(function () {
        const $container = $(this);
        const $beforeWrapper = $container.find('.video-wrapper.before');
        const $divider = $container.find('.divider');

        const $beforeElement = $container.find('.video-wrapper.before img, .video-wrapper.before video');
        const $afterVideoEl = $container.find('.video-wrapper.after video');

        let isBeforeElementImage = $beforeElement.is('img');
        let isBeforeElementVideo = $beforeElement.is('video');

        if ((!isBeforeElementImage && !isBeforeElementVideo) || $beforeElement.length === 0 || $afterVideoEl.length === 0) {
            console.warn('Video comparison setup skipped: before element (img or video) or after video not found in', $container);
            return;
        }

        const beforeElementMedia = $beforeElement.get(0);
        const afterVideoMedia = $afterVideoEl.get(0);

        let isDragging = false;
        let currentContainerWidth, currentContainerHeight;

        let dividerPositionPercent = 50;

        function updateSliderPosition(position) {
            const newPosition = Math.max(0, Math.min(position, currentContainerWidth || $container.width()));
            $beforeWrapper.css('width', newPosition + 'px');
            $divider.css('left', newPosition + 'px');
            dividerPositionPercent = (newPosition / (currentContainerWidth || $container.width())) * 100;
        }

        function initializeSizeAndPlay() {
            currentContainerWidth = $container.width();
            let elementNaturalWidth, elementNaturalHeight;

            if (isBeforeElementImage) {
                elementNaturalWidth = beforeElementMedia.naturalWidth;
                elementNaturalHeight = beforeElementMedia.naturalHeight;
            } else if (isBeforeElementVideo) {
                elementNaturalWidth = beforeElementMedia.videoWidth;
                elementNaturalHeight = beforeElementMedia.videoHeight;
            }

            if (elementNaturalWidth > 0 && elementNaturalHeight > 0) {
                const aspectRatio = elementNaturalHeight / elementNaturalWidth;
                currentContainerHeight = currentContainerWidth * aspectRatio;
            } else if (afterVideoMedia.videoHeight > 0 && afterVideoMedia.videoWidth > 0) {
                const aspectRatio = afterVideoMedia.videoHeight / afterVideoMedia.videoWidth;
                currentContainerHeight = currentContainerWidth * aspectRatio;
            } else {
                currentContainerHeight = currentContainerWidth * (9 / 16); // Default aspect ratio
            }
            $container.css('height', currentContainerHeight + 'px');

            $beforeElement.css({ width: currentContainerWidth + 'px', height: currentContainerHeight + 'px' });
            $afterVideoEl.css({ width: currentContainerWidth + 'px', height: currentContainerHeight + 'px' });

            updateSliderPosition(currentContainerWidth * dividerPositionPercent / 100);
            
            afterVideoMedia.currentTime = 0;
            if (isBeforeElementVideo) {
                beforeElementMedia.currentTime = 0;
            }
            
            setTimeout(function() {
                if (isBeforeElementVideo) {
                    const playPromiseBefore = beforeElementMedia.play();
                    if (playPromiseBefore !== undefined) {
                        playPromiseBefore.catch(error => console.error("Error attempting to play beforeVideo:", error, beforeElementMedia));
                    }
                }

                const playPromiseAfter = afterVideoMedia.play();
                if (playPromiseAfter !== undefined) {
                    playPromiseAfter.catch(error => console.error("Error attempting to play afterVideo:", error, afterVideoMedia));
                }
            }, 50); 
        }

        let beforeMediaReady = false;
        let afterVideoReady = false;

        let hasInitialized = false;
        
        function checkMediaReady() {
            if (beforeMediaReady && afterVideoReady && !hasInitialized) {
                hasInitialized = true;
                afterVideoMedia.currentTime = 0;
                if (isBeforeElementVideo) {
                    beforeElementMedia.currentTime = 0;
                }
                initializeSizeAndPlay();
            }
        }

        if (isBeforeElementImage) {
            if (beforeElementMedia.complete && beforeElementMedia.naturalWidth > 0) {
                beforeMediaReady = true;
            } else {
                $beforeElement.on('load', function () {
                    beforeMediaReady = true;
                    checkMediaReady();
                }).on('error', function () {
                    console.error("Error loading beforeImage for comparison.", beforeElementMedia);
                    beforeMediaReady = true; 
                    checkMediaReady();
                });
            }
        } else if (isBeforeElementVideo) {
            if (beforeElementMedia.readyState >= 3) { 
                beforeMediaReady = true;
            } else {
                $beforeElement.on('loadeddata canplaythrough', function () {
                    beforeMediaReady = true;
                    checkMediaReady();
                }).on('error', function () {
                    console.error("Error loading beforeVideo for comparison.", beforeElementMedia);
                    beforeMediaReady = true; 
                    checkMediaReady();
                });
            }
        }

        if (afterVideoMedia.readyState >= 3) { 
            afterVideoReady = true;
        } else {
            $afterVideoEl.on('loadeddata canplaythrough', function () {
                afterVideoReady = true;
                checkMediaReady();
            }).on('error', function () {
                console.error("Error loading afterVideo for comparison.", afterVideoMedia);
                afterVideoReady = true; 
                checkMediaReady();
            });
        }

        checkMediaReady(); 

        $(window).on('resize', function () {
            currentContainerWidth = $container.width();
            let elementNaturalWidth, elementNaturalHeight;

            if (isBeforeElementImage) {
                elementNaturalWidth = beforeElementMedia.naturalWidth;
                elementNaturalHeight = beforeElementMedia.naturalHeight;
            } else if (isBeforeElementVideo) {
                elementNaturalWidth = beforeElementMedia.videoWidth;
                elementNaturalHeight = beforeElementMedia.videoHeight;
            }

            if (elementNaturalWidth > 0 && elementNaturalHeight > 0) {
                currentContainerHeight = currentContainerWidth * (elementNaturalHeight / elementNaturalWidth);
            } else if (afterVideoMedia.videoHeight > 0 && afterVideoMedia.videoWidth > 0) {
                currentContainerHeight = currentContainerWidth * (afterVideoMedia.videoHeight / afterVideoMedia.videoWidth);
            } else {
                currentContainerHeight = currentContainerWidth * (9 / 16);
            }
            $container.css('height', currentContainerHeight + 'px');
            $beforeElement.css({ width: currentContainerWidth + 'px', height: currentContainerHeight + 'px' });
            $afterVideoEl.css({ width: currentContainerWidth + 'px', height: currentContainerHeight + 'px' });
            
            updateSliderPosition(currentContainerWidth * dividerPositionPercent / 100);
        });

        $divider.on('mousedown touchstart', function (e_down) {
            isDragging = true;
            $('body').addClass('dragging-video-slider');
            e_down.preventDefault();

            function handleMove(e_move) {
                if (!isDragging) return;
                let pageX = e_move.pageX;
                if (e_move.type === 'touchmove') {
                    if (e_move.originalEvent.touches && e_move.originalEvent.touches.length > 0) {
                        pageX = e_move.originalEvent.touches[0].pageX;
                    } else { return; }
                }
                const containerOffset = $container.offset().left;
                updateSliderPosition(pageX - containerOffset);
            }

            function handleUp() {
                if (isDragging) {
                    isDragging = false;
                    $('body').removeClass('dragging-video-slider');
                    $(document).off('mousemove touchmove', handleMove);
                    $(document).off('mouseup touchend', handleUp);
                }
            }
            $(document).on('mousemove touchmove', handleMove);
            $(document).on('mouseup touchend', handleUp);
        });

        function smoothLoopReset(videoElement, otherVideoElement) {
            const handleTimeUpdate = function() {
                if (videoElement.currentTime >= videoElement.duration - 0.1) {
                    videoElement.pause();
                    
                    videoElement.currentTime = 0;
                    
                    if (otherVideoElement && otherVideoElement.play) {
                        otherVideoElement.currentTime = 0;
                        otherVideoElement.play().catch(e => {});
                    }
                    
                    setTimeout(function() {
                        videoElement.play().catch(e => {});
                    }, 15);
                }
            };
            
            videoElement.addEventListener('timeupdate', handleTimeUpdate);
        }
        
        if (isBeforeElementVideo) {
            smoothLoopReset(beforeElementMedia, afterVideoMedia);
        }
        smoothLoopReset(afterVideoMedia, isBeforeElementVideo ? beforeElementMedia : null);
        
        let lastSyncTime = 0;
        $beforeElement.on('timeupdate', function() {
            const now = Date.now();
            if (now - lastSyncTime < 3000) return; 
            
            if (!isDragging && !beforeElementMedia.paused && !afterVideoMedia.paused) {
                const timeDiff = Math.abs(beforeElementMedia.currentTime - afterVideoMedia.currentTime);
                if (timeDiff > 1.0) { 
                    afterVideoMedia.currentTime = beforeElementMedia.currentTime;
                    lastSyncTime = now;
                }
            }
        });
    });
} 

function initializeStaticVideoLayout() {
    // 查找所有静态布局容器
    $('.video-static-flex').each(function() {
        const container = $(this);
        const imageWrapper = container.find('.static-wrapper.image');
        const videoWrapper = container.find('.static-wrapper.video');
        
        // 查找图片和视频元素
        const image = imageWrapper.find('img');
        const video = videoWrapper.find('video');
        
        // 检查元素是否存在
        if (image.length === 0 || video.length === 0) {
            console.log('未找到图片或视频元素');
            return;
        }
        
        // 简单地处理视频播放
        const videoElement = video[0];
        
        // 视频加载完后自动播放
        if (videoElement.readyState >= 3) {
            videoElement.play().catch(err => {
                console.log('视频播放失败:', err.message);
            });
        } else {
            video.on('canplay', function() {
                this.play().catch(err => {
                    console.log('视频播放失败:', err.message);
                });
            });
        }
        
        // 处理视频循环
        video.on('timeupdate', function() {
            if (this.currentTime >= this.duration - 0.1) {
                this.currentTime = 0;
            }
        });
    });
} 