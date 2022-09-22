#!/usr/bin/perl

use strict;
use warnings;

use IPC::System::Simple qw(capture);
use Path::Tiny;

# capture and parse freshly generated regexes
$_ = capture('node tools/generate-identifier-regex.js');
my ( $start, $part ) = /Start:\s+(\S+).*Part:\s+(\S+)/s;

# replace regexes
path('tools/generate-test-fixture.js')->edit_lines_utf8(
	sub {
		s/Start: new RegExp[^\[]+\K[^\]]+\]/$start/;
		s/Part: new RegExp[^\[]+\K[^\]]+\]/$part/;
	}
)
