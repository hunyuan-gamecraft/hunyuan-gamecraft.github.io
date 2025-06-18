$(function() {
    // 预先设置所有twentytwenty容器的初始高度，避免初始状态为0高度
    $('.twentytwenty-container').each(function() {
        // 添加loading类
        $(this).addClass('loading');
        
        var $container = $(this);
        var $firstImg = $container.find('img:first');
        
        // 将容器设置为与第一张图片相同的宽高比，避免布局闪烁
        $firstImg.on('load', function() {
            if (this.naturalWidth && this.naturalHeight) {
                var aspectRatio = this.naturalHeight / this.naturalWidth;
                var containerWidth = $container.width();
                $container.css('height', containerWidth * aspectRatio + 'px');
            }
        });
        
        // 如果图片已经加载完成，立即设置高度
        if ($firstImg[0].complete && $firstImg[0].naturalWidth) {
            var aspectRatio = $firstImg[0].naturalHeight / $firstImg[0].naturalWidth;
            var containerWidth = $container.width();
            $container.css('height', containerWidth * aspectRatio + 'px');
        }
    });
    
    // 图片加载处理函数
    function initializeTwentyTwenty() {
        $('.twentytwenty-container').twentytwenty({
            default_offset_pct: 0.5,  // 默认slider位置
            no_overlay: false         // 显示覆盖效果
        });
        
        // 移除loading类
        $('.twentytwenty-container').removeClass('loading');
        
        // 触发窗口调整事件以重新计算尺寸
        setTimeout(function() {
            $(window).trigger('resize');
        }, 100);
    }
    
    // 监听自定义图片加载完成事件
    $(document).on('twentytwenty:imagesLoaded', function() {
        initializeTwentyTwenty();
    });
    
    // 等待所有图片加载完成
    $(window).on('load', function() {
        initializeTwentyTwenty();
    });
    
    // 如果页面已加载完成，直接初始化
    if (document.readyState === 'complete') {
        initializeTwentyTwenty();
    } else {
        // 添加一个延迟初始化，确保在大多数情况下能正确显示
        setTimeout(initializeTwentyTwenty, 500);
    }
}); 