.PHONY: install lint test run preview-atlas build-atlas-route check-atlas-route clean

PYTHON ?= python3

install:
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

lint:
	flake8 spider.py tests/
	black --check spider.py tests/
	mypy spider.py

format:
	black spider.py tests/

test:
	pytest -v

run:
	$(PYTHON) spider.py

preview-atlas:
	$(PYTHON) scripts/serve_atlas.py 4173

build-atlas-route:
	$(PYTHON) scripts/build_atlas_route.py

check-atlas-route:
	$(PYTHON) scripts/build_atlas_route.py --check

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
