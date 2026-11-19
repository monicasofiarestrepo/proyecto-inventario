/*
 * Formulario de contacto -> info@bibatalentohumano.com
 *
 * Usa FormSubmit (https://formsubmit.co), que no necesita PHP ni guardar
 * contraseñas en el sitio. Funciona igual en Render y en Network Solutions.
 *
 * Primera vez: FormSubmit envía un correo de ACTIVACIÓN a info@. Hay que abrirlo
 * y hacer clic en "Activate Form". Después llegan todos los mensajes.
 * Tras activarlo, FormSubmit da un código aleatorio: se puede poner en
 * CONTACT_ENDPOINT en lugar del correo para que la dirección no quede en el código.
 */
var CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/info@bibatalentohumano.com';

$(document).ready(function () {
    var $form = $('#contact_form');
    var $btn = $('#submit_btn');
    var $notice = $('#notice');
    var $loading = $('#cargando');
    var sending = false;

    function showNotice(type, html) {
        $notice.removeClass().addClass('alert alert-' + type).html(html).hide().fadeIn(300);
    }

    function isEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }

    function setSending(on) {
        sending = on;
        $loading.css('display', on ? 'inline-block' : 'none');
        $btn.toggleClass('disabled', on).attr('aria-disabled', on ? 'true' : 'false');
    }

    function send(e) {
        if (e) e.preventDefault();
        if (sending) return;

        var data = {
            name: $.trim($('#name').val()),
            email: $.trim($('#email').val()),
            subject: $.trim($('#subject').val()),
            message: $.trim($('#message').val())
        };

        $notice.hide();
        var ok = true;
        $.each(['name', 'email', 'subject', 'message'], function (_, f) {
            if (!data[f]) { $('#' + f).css('border-color', 'red'); ok = false; }
        });
        if (!ok) {
            showNotice('warning', 'Por favor completa todos los campos.');
            return;
        }
        if (!isEmail(data.email)) {
            $('#email').css('border-color', 'red');
            showNotice('warning', 'Por favor escribe un correo electrónico válido.');
            return;
        }
        // Honeypot anti-spam: los bots llenan este campo oculto
        if ($('#website').val()) return;

        setSending(true);
        $.ajax({
            url: CONTACT_ENDPOINT,
            method: 'POST',
            dataType: 'json',
            timeout: 20000,
            data: {
                Nombre: data.name,
                email: data.email,
                Asunto: data.subject,
                Mensaje: data.message,
                _subject: 'Contacto web BIBA: ' + data.subject,
                _replyto: data.email,
                _template: 'table',
                _captcha: 'false'
            }
        }).done(function (res) {
            if (res && (res.success === true || res.success === 'true')) {
                $form[0].reset();
                showNotice('success', '¡Gracias, ' + $('<div>').text(data.name).html() +
                    '! Tu mensaje fue enviado. Te responderemos lo antes posible.');
            } else if (res && /activ/i.test(res.message || '')) {
                showNotice('warning', 'El formulario está pendiente de activación. Revisa el correo de ' +
                    'info@bibatalentohumano.com y haz clic en "Activate Form".');
            } else {
                showNotice('danger', 'No pudimos enviar tu mensaje. Escríbenos directamente a ' +
                    '<a href="mailto:info@bibatalentohumano.com">info@bibatalentohumano.com</a>.');
            }
        }).fail(function () {
            showNotice('danger', 'Hubo un problema de conexión al enviar el mensaje. Inténtalo de nuevo o escríbenos a ' +
                '<a href="mailto:info@bibatalentohumano.com">info@bibatalentohumano.com</a>.');
        }).always(function () {
            setSending(false);
        });
    }

    $form.on('submit', send);

    $('#contact_form input, #contact_form textarea').on('input', function () {
        $(this).css('border-color', '');
    });
});
