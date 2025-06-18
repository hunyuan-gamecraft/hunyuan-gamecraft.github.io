/**
 * 图片预加载器 - 确保twentytwenty比较组件中的图片在初始化前加载完成
 */
$(function() {
    // 预加载twentytwenty容器中的所有图片
    function preloadTwentyTwentyImages() {
        // 获取所有twentytwenty容器中的图片
        var $images = $('.twentytwenty-container img');
        var loadedCount = 0;
        var totalImages = $images.length;
        
        // 如果没有图片，则直接返回
        if (totalImages === 0) return;
        
        // 为每个图片设置加载事件
        $images.each(function() {
            var $img = $(this);
            
            // 如果图片已经加载完成
            if ($img[0].complete) {
                loadedCount++;
                checkAllLoaded();
            } else {
                // 设置加载事件
                $img.on('load', function() {
                    loadedCount++;
                    checkAllLoaded();
                }).on('error', function() {
                    // 即使加载失败也计数
                    loadedCount++;
                    checkAllLoaded();
                });
                
                // 确保IE/Edge触发load事件
                if ($img[0].complete) {
                    $img.trigger('load');
                }
            }
        });
        
        // 检查是否所有图片都已加载
        function checkAllLoaded() {
            if (loadedCount >= totalImages) {
                // 所有图片加载完成，触发自定义事件
                $(document).trigger('twentytwenty:imagesLoaded');
            }
        }
    }
    
    // 启动预加载
    preloadTwentyTwentyImages();
}); 