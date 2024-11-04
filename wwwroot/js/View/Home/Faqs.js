$(document).ready(function () {
    $(".answer").css("display", "none");
    $(".question").on("click", function () {
        var id = $(this).attr("id");
        var hasClass = $("#" + id).hasClass("show");
        if (hasClass === false) {
            $(this).addClass("show");
            $("#a-" + id).css("display", "block");
            $("#" + id + ">button").addClass("minus-btn");
        } else {
            $(this).removeClass("show");
            $("#a-" + id).css("display", "none");
            $("#" + id + ">button").removeClass("minus-btn");
        }
    });
});
