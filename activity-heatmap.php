<?php
/**
 * Plugin Name: Activity Heatmap
 * Description: 显示用户活动的 GitHub 风格热力图。
 * Version: 2.0
 * Author: zzhou
 */

defined('ABSPATH') || exit;

// 加载资源
function ahm_enqueue_assets() {
    wp_enqueue_style('ahm-heatmap-style', plugin_dir_url(__FILE__) . 'css/heatmap.css');
    wp_enqueue_script('ahm-heatmap-script', plugin_dir_url(__FILE__) . 'js/heatmap.js', [], false, true);

    // 本地化数据
    wp_localize_script('ahm-heatmap-script', 'ahmData', [
        'ajax_url' => admin_url('admin-ajax.php'),
    ]);
}
add_action('wp_enqueue_scripts', 'ahm_enqueue_assets');

// 数据接口
function ahm_get_post_activity_data() {
    global $wpdb;
    $year = intval($_GET['year'] ?? date('Y'));

    $results = $wpdb->get_results($wpdb->prepare("
        SELECT DATE(post_date) AS date, COUNT(*) AS count
        FROM {$wpdb->posts}
        WHERE post_type = 'post'
        AND post_status = 'publish'
        AND YEAR(post_date) = %d
        GROUP BY DATE(post_date)
    ", $year));

    $data = [];
    foreach ($results as $row) {
        $data[$row->date] = intval($row->count);
    }

    wp_send_json_success($data);
}
add_action('wp_ajax_ahm_get_data', 'ahm_get_post_activity_data');
add_action('wp_ajax_nopriv_ahm_get_data', 'ahm_get_post_activity_data');

// 短代码输出容器
function ahm_render_heatmap_container() {
    $year = date('Y');
    return "<div id='ahm-heatmap' data-year='$year'></div>";
}
add_shortcode('activity_heatmap', 'ahm_render_heatmap_container');
