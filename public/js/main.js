$(function(){
    if ($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').on('click', function(){
        if (!confirm('Are you sure want to delete this page?'))
        return false;
    });

    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancyBox();
    }
});